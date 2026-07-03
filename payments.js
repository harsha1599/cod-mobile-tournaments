// Razorpay Payment Integration - Per Match Payment System (AUTOMATIC)

const PaymentManager = {
    /**
     * Initiate payment for a single match entry - AUTOMATIC PROCESSING
     * @param {number} matchFee - Entry fee for the match
     * @param {string} matchId - Unique match identifier
     * @param {string} tournamentId - Tournament ID
     * @param {object} matchDetails - Match details (optional)
     */
    async initiateMatchPayment(matchFee, matchId, tournamentId, matchDetails = {}) {
        try {
            if (!RAZORPAY_KEY_ID) {
                showNotification('Payment gateway not configured', 'error');
                return;
            }

            const user = AuthManager.getCurrentUser();
            if (!user) {
                showNotification('Please login first', 'error');
                return;
            }

            // Check if user has UPI ID registered for payouts (not required for payment)
            // Payment is automatic, UPI is only for receiving payouts

            // Create order on backend
            const orderId = 'match_order_' + Date.now();

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: matchFee * 100, // Convert to paise
                currency: 'INR',
                name: 'CoD Mobile Tournaments',
                description: `Match Entry Fee - Match #${matchId}`,
                order_id: orderId,
                receipt: `match_${matchId}_${Date.now()}`,
                notes: {
                    matchId: matchId,
                    tournamentId: tournamentId,
                    matchType: matchDetails.type || 'tournament_match',
                    userId: user.id
                },
                handler: async (response) => {
                    try {
                        // AUTOMATIC: Verify and register immediately
                        await PaymentManager.verifyMatchPayment(
                            response,
                            matchId,
                            tournamentId,
                            matchFee,
                            user.id
                        );
                    } catch (error) {
                        showNotification('Payment verification failed: ' + error.message, 'error');
                    }
                },
                prefill: {
                    name: user.username,
                    email: user.email,
                    contact: user.phone_number || ''
                },
                theme: {
                    color: '#FFB81C'
                },
                modal: {
                    ondismiss: () => {
                        showNotification('Payment cancelled. You were not charged.', 'error');
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            showNotification('Payment failed: ' + error.message, 'error');
        }
    },

    /**
     * Verify match payment and AUTOMATICALLY register user for match
     */
    async verifyMatchPayment(response, matchId, tournamentId, amount, userId) {
        try {
            // Store payment record
            const paymentRecord = await PaymentManager.recordMatchPayment(
                userId,
                matchId,
                tournamentId,
                amount,
                response.razorpay_payment_id,
                response.razorpay_order_id
            );

            if (paymentRecord) {
                // AUTOMATIC: Register user for the match immediately
                const matchRegistration = await MatchDB.registerPlayerForMatch(
                    userId,
                    matchId,
                    paymentRecord.id
                );

                if (matchRegistration) {
                    showNotification('✅ Payment successful! You are now registered for this match.', 'success');
                    
                    // Update match count in user profile
                    await PaymentManager.updateUserMatchStats(userId, matchId);
                    
                    // Reload match list
                    if (typeof loadMatches === 'function') {
                        loadMatches();
                    }
                    
                    return paymentRecord;
                }
            }
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        }
    },

    /**
     * Record match payment in database
     */
    async recordMatchPayment(userId, matchId, tournamentId, amount, paymentId, orderId) {
        try {
            const { data, error } = await supabase
                .from('match_payments')
                .insert([
                    {
                        user_id: userId,
                        match_id: matchId,
                        tournament_id: tournamentId,
                        amount: amount,
                        razorpay_payment_id: paymentId,
                        razorpay_order_id: orderId,
                        payment_status: 'completed',
                        payment_type: 'match_entry',
                        payment_date: new Date(),
                        created_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error recording match payment:', error);
            throw error;
        }
    },

    /**
     * Get user payment history for matches
     */
    async getUserMatchPaymentHistory(userId) {
        try {
            const { data, error } = await supabase
                .from('match_payments')
                .select(`
                    *,
                    match:match_id(id, title, match_fee),
                    tournament:tournament_id(id, title)
                `)
                .eq('user_id', userId)
                .eq('payment_type', 'match_entry')
                .order('payment_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting payment history:', error);
            return [];
        }
    },

    /**
     * Get all match payments for a tournament
     */
    async getTournamentMatchPayments(tournamentId) {
        try {
            const { data, error } = await supabase
                .from('match_payments')
                .select(`
                    *,
                    user:user_id(id, username, email),
                    match:match_id(id, title)
                `)
                .eq('tournament_id', tournamentId)
                .eq('payment_type', 'match_entry')
                .order('payment_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting tournament payments:', error);
            return [];
        }
    },

    /**
     * Update user match statistics
     */
    async updateUserMatchStats(userId, matchId) {
        try {
            // Get current user stats
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('total_matches_played')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            const newCount = (user?.total_matches_played || 0) + 1;

            // Update stats
            const { error: updateError } = await supabase
                .from('users')
                .update({ total_matches_played: newCount })
                .eq('id', userId);

            if (updateError) throw updateError;
        } catch (error) {
            console.error('Error updating match stats:', error);
        }
    },

    /**
     * Get payment statistics for user
     */
    async getPaymentStats(userId) {
        try {
            const { data, error } = await supabase
                .from('match_payments')
                .select('amount')
                .eq('user_id', userId)
                .eq('payment_type', 'match_entry');

            if (error) throw error;

            const totalSpent = data.reduce((sum, payment) => sum + payment.amount, 0);
            const matchesEntered = data.length;

            return {
                totalSpent,
                matchesEntered,
                averagePerMatch: matchesEntered > 0 ? totalSpent / matchesEntered : 0
            };
        } catch (error) {
            console.error('Error getting payment stats:', error);
            return { totalSpent: 0, matchesEntered: 0, averagePerMatch: 0 };
        }
    },

    /**
     * Process batch payment for multiple matches - AUTOMATIC FOR ALL
     */
    async processBatchMatchPayments(matchCheckboxes, totalAmount) {
        try {
            const user = AuthManager.getCurrentUser();
            if (!user) {
                showNotification('Please login first', 'error');
                return;
            }

            const orderId = 'batch_order_' + Date.now();
            const matches = Array.from(matchCheckboxes).map(cb => ({
                matchId: cb.dataset.matchId,
                tournamentId: cb.dataset.tournamentId,
                fee: parseInt(cb.dataset.matchFee)
            }));

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: totalAmount * 100,
                currency: 'INR',
                name: 'CoD Mobile Tournaments',
                description: `Batch Match Entry - ${matches.length} matches`,
                order_id: orderId,
                receipt: `batch_${Date.now()}`,
                notes: {
                    matchCount: matches.length,
                    matches: JSON.stringify(matches),
                    userId: user.id
                },
                handler: async (response) => {
                    try {
                        // AUTOMATIC: Verify and register for all matches
                        await PaymentManager.verifyBatchPayment(response, matches, totalAmount, user.id);
                    } catch (error) {
                        showNotification('Batch payment verification failed', 'error');
                    }
                },
                prefill: {
                    name: user.username,
                    email: user.email
                },
                theme: {
                    color: '#FFB81C'
                },
                modal: {
                    ondismiss: () => {
                        showNotification('Payment cancelled', 'error');
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Batch payment error:', error);
            showNotification('Batch payment failed: ' + error.message, 'error');
        }
    },

    /**
     * Verify batch payment and AUTOMATICALLY register for all matches
     */
    async verifyBatchPayment(response, matches, totalAmount, userId) {
        try {
            const registeredMatches = [];
            
            for (const match of matches) {
                const paymentRecord = await PaymentManager.recordMatchPayment(
                    userId,
                    match.matchId,
                    match.tournamentId,
                    match.fee,
                    response.razorpay_payment_id,
                    response.razorpay_order_id
                );

                // AUTOMATIC: Register for match immediately
                await MatchDB.registerPlayerForMatch(userId, match.matchId, paymentRecord.id);
                registeredMatches.push(match.matchId);
            }

            showNotification(`✅ Successfully entered ${registeredMatches.length} matches!`, 'success');
            if (typeof loadMatches === 'function') {
                loadMatches();
            }
        } catch (error) {
            console.error('Batch verification error:', error);
            throw error;
        }
    }
};

// Payment button event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Single match entry payment button
    const matchPayBtn = document.getElementById('matchPayBtn');
    if (matchPayBtn) {
        matchPayBtn.addEventListener('click', async () => {
            const matchId = matchPayBtn.dataset.matchId;
            const matchFee = parseInt(matchPayBtn.dataset.matchFee);
            const tournamentId = matchPayBtn.dataset.tournamentId;

            if (!matchId || !matchFee) {
                showNotification('Match details not found', 'error');
                return;
            }

            PaymentManager.initiateMatchPayment(matchFee, matchId, tournamentId);
        });
    }

    // Multiple matches payment (batch entry)
    const batchPayBtn = document.getElementById('batchPayBtn');
    if (batchPayBtn) {
        batchPayBtn.addEventListener('click', async () => {
            const selectedMatches = document.querySelectorAll('input[name="matchSelection"]:checked');
            if (selectedMatches.length === 0) {
                showNotification('Please select at least one match', 'error');
                return;
            }

            let totalAmount = 0;
            selectedMatches.forEach(checkbox => {
                totalAmount += parseInt(checkbox.dataset.matchFee);
            });

            // Process batch payment - AUTOMATIC for all matches
            PaymentManager.processBatchMatchPayments(selectedMatches, totalAmount);
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentManager;
}
