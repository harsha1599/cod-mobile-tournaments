// Admin Panel System

const AdminPanel = {
    // Admin Role Check
    async isAdmin(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data?.role === 'admin';
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    },

    // User Management
    async getUsersList(filters = {}) {
        try {
            let query = supabase
                .from('users')
                .select('*');

            if (filters.role) {
                query = query.eq('role', filters.role);
            }
            if (filters.search) {
                query = query.ilike('username', `%${filters.search}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting users list:', error);
            return [];
        }
    },

    async suspendUser(userId, duration = 'permanent', reason = '') {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    is_suspended: true,
                    suspended_until: duration === 'permanent' ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
                    suspension_reason: reason
                })
                .eq('id', userId)
                .select();

            if (error) throw error;
            showNotification('User suspended successfully', 'success');
            return data[0];
        } catch (error) {
            console.error('Error suspending user:', error);
            throw error;
        }
    },

    async unsuspendUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    is_suspended: false,
                    suspended_until: null
                })
                .eq('id', userId)
                .select();

            if (error) throw error;
            showNotification('User unsuspended', 'success');
            return data[0];
        } catch (error) {
            console.error('Error unsuspending user:', error);
            throw error;
        }
    },

    // Tournament Management
    async createTournament(tournamentData) {
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .insert([tournamentData])
                .select();

            if (error) throw error;
            showNotification('Tournament created successfully', 'success');
            return data[0];
        } catch (error) {
            console.error('Error creating tournament:', error);
            throw error;
        }
    },

    async editTournament(tournamentId, updates) {
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .update(updates)
                .eq('id', tournamentId)
                .select();

            if (error) throw error;
            showNotification('Tournament updated', 'success');
            return data[0];
        } catch (error) {
            console.error('Error updating tournament:', error);
            throw error;
        }
    },

    async deleteTournament(tournamentId) {
        try {
            const { error } = await supabase
                .from('tournaments')
                .delete()
                .eq('id', tournamentId);

            if (error) throw error;
            showNotification('Tournament deleted', 'success');
        } catch (error) {
            console.error('Error deleting tournament:', error);
            throw error;
        }
    },

    // Report Management
    async getReports(status = 'open') {
        try {
            const { data, error } = await supabase
                .from('user_reports')
                .select(`
                    *,
                    reporter:reporter_id(username),
                    reported_user:reported_user_id(username)
                `)
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting reports:', error);
            return [];
        }
    },

    async resolveReport(reportId, action, notes = '') {
        try {
            const { data, error } = await supabase
                .from('user_reports')
                .update({
                    status: 'resolved',
                    action_taken: action,
                    resolution_notes: notes,
                    resolved_at: new Date()
                })
                .eq('id', reportId)
                .select();

            if (error) throw error;
            showNotification('Report resolved', 'success');
            return data[0];
        } catch (error) {
            console.error('Error resolving report:', error);
            throw error;
        }
    },

    // Financial Reports
    async getFinancialReport(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            if (error) throw error;
            return this.calculateFinancialStats(data || []);
        } catch (error) {
            console.error('Error getting financial report:', error);
            return null;
        }
    },

    calculateFinancialStats(transactions) {
        let totalRevenue = 0;
        let totalRefunds = 0;
        let totalTransactions = transactions.length;

        transactions.forEach(tx => {
            if (tx.type === 'entry_fee') totalRevenue += tx.amount;
            if (tx.type === 'refund') totalRefunds += tx.amount;
        });

        return {
            totalRevenue,
            totalRefunds,
            netRevenue: totalRevenue - totalRefunds,
            totalTransactions,
            averageTransactionValue: totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : 0
        };
    },

    // Moderator Tools
    async addModerator(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ role: 'moderator' })
                .eq('id', userId)
                .select();

            if (error) throw error;
            showNotification('Moderator added', 'success');
            return data[0];
        } catch (error) {
            console.error('Error adding moderator:', error);
            throw error;
        }
    },

    async removeModerator(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ role: 'user' })
                .eq('id', userId)
                .select();

            if (error) throw error;
            showNotification('Moderator removed', 'success');
            return data[0];
        } catch (error) {
            console.error('Error removing moderator:', error);
            throw error;
        }
    }
};