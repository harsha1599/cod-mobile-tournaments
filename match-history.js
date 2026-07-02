// Match History Management

const MatchHistory = {
    async recordMatch(userId, opponentId, winnerId, tournamentId, matchStats) {
        try {
            const { data, error } = await supabase
                .from('match_history')
                .insert([
                    {
                        user_id: userId,
                        opponent_id: opponentId,
                        winner_id: winnerId,
                        tournament_id: tournamentId,
                        stats: matchStats,
                        played_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error recording match:', error);
            throw error;
        }
    },

    async getUserMatchHistory(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('match_history')
                .select(`
                    *,
                    opponent:opponent_id(id, username, avatar),
                    winner:winner_id(id, username)
                `)
                .or(`user_id.eq.${userId},opponent_id.eq.${userId}`)
                .order('played_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting match history:', error);
            return [];
        }
    },

    async getHeadToHeadStats(userId, opponentId) {
        try {
            const { data, error } = await supabase
                .from('match_history')
                .select('winner_id')
                .or(`and(user_id.eq.${userId},opponent_id.eq.${opponentId}),and(user_id.eq.${opponentId},opponent_id.eq.${userId})`);

            if (error) throw error;

            let userWins = 0;
            let opponentWins = 0;

            data.forEach(match => {
                if (match.winner_id === userId) userWins++;
                else if (match.winner_id === opponentId) opponentWins++;
            });

            return {
                userWins,
                opponentWins,
                totalMatches: data.length,
                userWinRate: data.length > 0 ? ((userWins / data.length) * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Error getting head to head stats:', error);
            return null;
        }
    },

    async getMatchStats(userId) {
        try {
            const { data, error } = await supabase
                .from('match_history')
                .select('winner_id')
                .or(`user_id.eq.${userId},opponent_id.eq.${userId}`);

            if (error) throw error;

            let wins = 0;
            data.forEach(match => {
                if (match.winner_id === userId) wins++;
            });

            return {
                totalMatches: data.length,
                wins: wins,
                losses: data.length - wins,
                winRate: data.length > 0 ? ((wins / data.length) * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Error getting match stats:', error);
            return null;
        }
    },

    async getRecentMatches(userId, days = 7) {
        try {
            const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            
            const { data, error } = await supabase
                .from('match_history')
                .select('*')
                .or(`user_id.eq.${userId},opponent_id.eq.${userId}`)
                .gte('played_at', sinceDate.toISOString())
                .order('played_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting recent matches:', error);
            return [];
        }
    },

    displayMatchHistory(matches) {
        const container = document.createElement('div');
        container.className = 'match-history-container';

        if (matches.length === 0) {
            container.innerHTML = '<p>No match history yet</p>';
            return container;
        }

        const historyHTML = matches.map(match => `
            <div class="match-history-item">
                <div class="match-date">${new Date(match.played_at).toLocaleDateString()}</div>
                <div class="match-result">
                    <span class="player-name">${match.opponent.username}</span>
                    <span class="match-outcome ${match.winner_id === match.user_id ? 'win' : 'loss'}">
                        ${match.winner_id === match.user_id ? '✅ WIN' : '❌ LOSS'}
                    </span>
                </div>
            </div>
        `).join('');

        container.innerHTML = historyHTML;
        return container;
    }
};