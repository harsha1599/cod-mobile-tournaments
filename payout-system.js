// Automated Payouts System

const PayoutSystem = {
    // Prize Distribution
    async distributePrizes(tournamentId) {
        try {
            // Get tournament standings
            const standings = await TournamentResults.getTournamentFinalStandings(tournamentId);
            
            // Get tournament prize pool
            const tournament = await TournamentDB.getTournamentById(tournamentId);
            
            // Calculate prize distribution (typical 40-30-20-10 split for top 4)
            const prizePool = parseInt(tournament.prize_pool.replace(/[^0-9]/g, ''));
            const prizeDistribution = [
                { rank: 1, percentage: 0.40 },
                { rank: 2, percentage: 0.30 },
                { rank: 3, percentage: 0.20 },
                { rank: 4, percentage: 0.10 }
            ];

            const payouts = [];
            for (let i = 0; i < Math.min(standings.length, prizeDistribution.length); i++) {
                const player = standings[i];
                const prizeAmount = prizePool * prizeDistribution[i].percentage;

                const payout = await this.createPayout(
                    player.id,
                    tournamentId,
                    prizeAmount,
                    `Prize for ranking ${player.rank} in tournament`
                );

                payouts.push(payout);
            }

            showNotification(`${payouts.length} prize payouts initiated`, 'success');
            return payouts;
        } catch (error) {
            console.error('Error distributing prizes:', error);
            throw error;
        }
    },

    async createPayout(userId, tournamentId, amount, description) {
        try {
            const { data, error } = await supabase
                .from('payouts')
                .insert([
                    {
                        user_id: userId,
                        tournament_id: tournamentId,
                        amount: amount,
                        description: description,
                        status: 'pending',
                        created_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating payout:', error);
            throw error;
        }
    },

    async processPayout(payoutId) {
        try {
            // Get payout details
            const { data: payout, error: payoutError } = await supabase
                .from('payouts')
                .select('*')
                .eq('id', payoutId)
                .single();

            if (payoutError) throw payoutError;

            // Get user bank details
            const { data: userBank, error: bankError } = await supabase
                .from('user_bank_details')
                .select('*')
                .eq('user_id', payout.user_id)
                .single();

            if (bankError) throw bankError;

            // Initialize Razorpay payout
            const payoutResponse = await this.initializeRazorpayPayout(
                payout.amount,
                userBank,
                payout.description
            );

            // Update payout status
            const { data: updated, error: updateError } = await supabase
                .from('payouts')
                .update({
                    status: 'processing',
                    razorpay_payout_id: payoutResponse.id,
                    processed_at: new Date()
                })
                .eq('id', payoutId)
                .select();

            if (updateError) throw updateError;
            showNotification('Payout processing initiated', 'success');
            return updated[0];
        } catch (error) {
            console.error('Error processing payout:', error);
            throw error;
        }
    },

    async initializeRazorpayPayout(amount, bankDetails, description) {
        try {
            // In production, call Razorpay API through your backend
            // This is a mock implementation
            return {
                id: 'payout_' + Date.now(),
                amount: amount,
                currency: 'INR',
                status: 'queued',
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error initializing Razorpay payout:', error);
            throw error;
        }
    },

    async getPendingPayouts() {
        try {
            const { data, error } = await supabase
                .from('payouts')
                .select(`
                    *,
                    user:user_id(username, email)
                `)
                .in('status', ['pending', 'processing'])
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting pending payouts:', error);
            return [];
        }
    },

    async getUserPayoutHistory(userId) {
        try {
            const { data, error } = await supabase
                .from('payouts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting payout history:', error);
            return [];
        }
    },

    async addBankDetails(userId, bankDetails) {
        try {
            const { data, error } = await supabase
                .from('user_bank_details')
                .upsert([
                    {
                        user_id: userId,
                        account_holder_name: bankDetails.accountHolderName,
                        account_number: bankDetails.accountNumber,
                        ifsc_code: bankDetails.ifscCode,
                        bank_name: bankDetails.bankName,
                        updated_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            showNotification('Bank details saved', 'success');
            return data[0];
        } catch (error) {
            console.error('Error saving bank details:', error);
            throw error;
        }
    }
};