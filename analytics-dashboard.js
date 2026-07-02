// Analytics Dashboard

const AnalyticsDashboard = {
    async getDashboardStats() {
        try {
            const stats = {};

            // User Statistics
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id, created_at');
            
            if (!userError) {
                stats.totalUsers = users.length;
                stats.newUsersThisMonth = users.filter(u => {
                    const date = new Date(u.created_at);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length;
            }

            // Tournament Statistics
            const { data: tournaments, error: tournamentError } = await supabase
                .from('tournaments')
                .select('*');
            
            if (!tournamentError) {
                stats.totalTournaments = tournaments.length;
                stats.activeTournaments = tournaments.filter(t => t.status === 'ongoing').length;
            }

            // Registration Statistics
            const { data: registrations, error: regError } = await supabase
                .from('registrations')
                .select('id');
            
            if (!regError) {
                stats.totalRegistrations = registrations.length;
            }

            // Revenue Statistics
            const { data: transactions, error: txError } = await supabase
                .from('transactions')
                .select('amount, type');
            
            if (!txError) {
                stats.totalRevenue = transactions
                    .filter(t => t.type === 'entry_fee')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                stats.totalRefunds = transactions
                    .filter(t => t.type === 'refund')
                    .reduce((sum, t) => sum + t.amount, 0);
            }

            return stats;
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return null;
        }
    },

    async getUserGrowthChart(days = 30) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('created_at');

            if (error) throw error;

            const chartData = {};
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                chartData[dateStr] = 0;
            }

            data.forEach(user => {
                const dateStr = new Date(user.created_at).toISOString().split('T')[0];
                if (chartData.hasOwnProperty(dateStr)) {
                    chartData[dateStr]++;
                }
            });

            return chartData;
        } catch (error) {
            console.error('Error getting user growth chart:', error);
            return null;
        }
    },

    async getRevenueChart(days = 30) {
        try {
            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - days);

            const { data, error } = await supabase
                .from('transactions')
                .select('amount, type, created_at')
                .gte('created_at', sinceDate.toISOString());

            if (error) throw error;

            const chartData = {};
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                chartData[dateStr] = 0;
            }

            data.forEach(tx => {
                const dateStr = new Date(tx.created_at).toISOString().split('T')[0];
                if (tx.type === 'entry_fee') {
                    chartData[dateStr] += tx.amount;
                } else if (tx.type === 'refund') {
                    chartData[dateStr] -= tx.amount;
                }
            });

            return chartData;
        } catch (error) {
            console.error('Error getting revenue chart:', error);
            return null;
        }
    },

    async getTournamentAnalytics(tournamentId) {
        try {
            const tournament = await TournamentDB.getTournamentById(tournamentId);
            
            const { data: registrations, error: regError } = await supabase
                .from('registrations')
                .select('id')
                .eq('tournament_id', tournamentId);

            const { data: results, error: resultError } = await supabase
                .from('match_results')
                .select('id')
                .eq('tournament_id', tournamentId);

            if (regError || resultError) throw new Error('Error fetching data');

            return {
                name: tournament.name,
                totalRegistrations: registrations.length,
                totalMatches: results.length,
                prizePool: tournament.prize_pool,
                entryFee: tournament.entry_fee,
                status: tournament.status,
                totalRevenue: registrations.length * parseInt(tournament.entry_fee.replace(/[^0-9]/g, ''))
            };
        } catch (error) {
            console.error('Error getting tournament analytics:', error);
            return null;
        }
    },

    async getPlayerAnalytics(userId) {
        try {
            const user = await UserDB.getUser(userId);
            
            const matchStats = await MatchHistory.getMatchStats(userId);
            const registrations = await RegistrationDB.getUserRegistrations(userId);
            const payouts = await PayoutSystem.getUserPayoutHistory(userId);

            const totalEarnings = payouts
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0);

            return {
                username: user.username,
                totalWins: user.wins,
                totalPoints: user.points,
                tournamentsPlayed: user.tournaments_played,
                ...matchStats,
                tournamentsEntered: registrations.length,
                totalEarnings: totalEarnings,
                joinDate: new Date(user.created_at).toLocaleDateString()
            };
        } catch (error) {
            console.error('Error getting player analytics:', error);
            return null;
        }
    },

    async getTopPerformers(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, wins, points, avatar')
                .order('points', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting top performers:', error);
            return [];
        }
    },

    async generateReport(reportType, filters = {}) {
        try {
            let report = {};

            switch(reportType) {
                case 'overview':
                    report = await this.getDashboardStats();
                    break;
                case 'revenue':
                    report.data = await this.getRevenueChart(filters.days || 30);
                    report.type = 'revenue';
                    break;
                case 'users':
                    report.data = await this.getUserGrowthChart(filters.days || 30);
                    report.type = 'users';
                    break;
                case 'tournament':
                    report = await this.getTournamentAnalytics(filters.tournamentId);
                    break;
                case 'player':
                    report = await this.getPlayerAnalytics(filters.userId);
                    break;
            }

            report.generatedAt = new Date();
            return report;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    },

    async exportReportAsCSV(reportData, filename) {
        try {
            const csv = this.convertToCSV(reportData);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'report.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Report exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting report:', error);
            throw error;
        }
    },

    convertToCSV(data) {
        const headers = Object.keys(data);
        const values = Object.values(data);
        
        let csv = headers.join(',') + '\n';
        csv += values.join(',');
        
        return csv;
    }
};