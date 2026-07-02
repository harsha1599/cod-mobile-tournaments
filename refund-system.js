// Refund Management System

const RefundSystem = {
    async requestRefund(registrationId, reason, evidence = []) {
        try {
            const user = AuthManager.getCurrentUser();

            const { data, error } = await supabase
                .from('refund_requests')
                .insert([
                    {
                        registration_id: registrationId,
                        user_id: user.id,
                        reason: reason,
                        evidence: evidence,
                        status: 'pending',
                        requested_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            showNotification('Refund request submitted. We will review shortly.', 'success');
            return data[0];
        } catch (error) {
            console.error('Error requesting refund:', error);
            throw error;
        }
    },

    async approveRefund(refundRequestId, notes = '') {
        try {
            // Get refund request
            const { data: refundRequest, error: requestError } = await supabase
                .from('refund_requests')
                .select(`
                    *,
                    registration:registration_id(payment_id, entry_fee, user_id)
                `)
                .eq('id', refundRequestId)
                .single();

            if (requestError) throw requestError;

            // Update refund request status
            const { error: updateError } = await supabase
                .from('refund_requests')
                .update({
                    status: 'approved',
                    admin_notes: notes,
                    approved_at: new Date()
                })
                .eq('id', refundRequestId);

            if (updateError) throw updateError;

            // Process refund through Razorpay
            await this.processRefundThroughRazorpay(
                refundRequest.registration.payment_id,
                refundRequest.registration.entry_fee
            );

            // Record refund transaction
            await supabase
                .from('transactions')
                .insert([
                    {
                        user_id: refundRequest.registration.user_id,
                        type: 'refund',
                        amount: refundRequest.registration.entry_fee,
                        description: `Refund for tournament entry`,
                        status: 'completed',
                        created_at: new Date()
                    }
                ]);

            showNotification('Refund approved and processed', 'success');
            return refundRequest;
        } catch (error) {
            console.error('Error approving refund:', error);
            throw error;
        }
    },

    async rejectRefund(refundRequestId, reason = '') {
        try {
            const { data, error } = await supabase
                .from('refund_requests')
                .update({
                    status: 'rejected',
                    rejection_reason: reason,
                    rejected_at: new Date()
                })
                .eq('id', refundRequestId)
                .select();

            if (error) throw error;
            showNotification('Refund request rejected', 'success');
            return data[0];
        } catch (error) {
            console.error('Error rejecting refund:', error);
            throw error;
        }
    },

    async processRefundThroughRazorpay(paymentId, amount) {
        try {
            // In production, call Razorpay API through your backend
            // Mock implementation for demo
            const refundResponse = {
                id: 'rfnd_' + Date.now(),
                payment_id: paymentId,
                amount: amount,
                currency: 'INR',
                status: 'processed',
                timestamp: new Date()
            };

            return refundResponse;
        } catch (error) {
            console.error('Error processing refund through Razorpay:', error);
            throw error;
        }
    },

    async getRefundRequests(filters = {}) {
        try {
            let query = supabase
                .from('refund_requests')
                .select(`
                    *,
                    user:user_id(username, email),
                    registration:registration_id(entry_fee)
                `);

            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.userId) {
                query = query.eq('user_id', filters.userId);
            }

            const { data, error } = await query.order('requested_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting refund requests:', error);
            return [];
        }
    },

    async getUserRefundRequests(userId) {
        try {
            const { data, error } = await supabase
                .from('refund_requests')
                .select('*')
                .eq('user_id', userId)
                .order('requested_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting user refund requests:', error);
            return [];
        }
    },

    async getRefundStats() {
        try {
            const { data, error } = await supabase
                .from('refund_requests')
                .select('status, registration_id');

            if (error) throw error;

            const stats = {
                pending: 0,
                approved: 0,
                rejected: 0,
                totalAmount: 0
            };

            data.forEach(request => {
                if (request.status === 'pending') stats.pending++;
                if (request.status === 'approved') stats.approved++;
                if (request.status === 'rejected') stats.rejected++;
            });

            return stats;
        } catch (error) {
            console.error('Error getting refund stats:', error);
            return null;
        }
    },

    async autoRefundCancelledTournaments(tournamentId) {
        try {
            // Get all registrations for the tournament
            const { data: registrations, error: regError } = await supabase
                .from('registrations')
                .select('*')
                .eq('tournament_id', tournamentId);

            if (regError) throw regError;

            // Refund each registration
            const refunds = [];
            for (const registration of registrations) {
                const payout = await PayoutSystem.createPayout(
                    registration.user_id,
                    tournamentId,
                    registration.entry_fee,
                    `Automatic refund for cancelled tournament`
                );
                refunds.push(payout);
            }

            showNotification(`${refunds.length} automatic refunds initiated`, 'success');
            return refunds;
        } catch (error) {
            console.error('Error auto-refunding tournament:', error);
            throw error;
        }
    }
};