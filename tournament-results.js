// Tournament Results Management System

const TournamentResults = {
    async submitMatchResult(tournamentId, matchId, winnerId, loserId, score, screenshots = []) {
        try {
            const { data, error } = await supabase
                .from('match_results')
                .insert([
                    {
                        tournament_id: tournamentId,
                        match_id: matchId,
                        winner_id: winnerId,
                        loser_id: loserId,
                        score: score,
                        screenshots: screenshots,
                        status: 'pending_verification',
                        submitted_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            showNotification('Match result submitted for verification', 'success');
            return data[0];
        } catch (error) {
            console.error('Error submitting match result:', error);
            throw error;
        }
    },

    async getTournamentResults(tournamentId) {
        try {
            const { data, error } = await supabase
                .from('match_results')
                .select(`
                    *,
                    winner:winner_id(username),
                    loser:loser_id(username)
                `)
                .eq('tournament_id', tournamentId)
                .eq('status', 'verified');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting tournament results:', error);
            return [];
        }
    },

    async getMatchDetails(matchId) {
        try {
            const { data, error } = await supabase
                .from('match_results')
                .select(`
                    *,
                    winner:winner_id(id, username, avatar),
                    loser:loser_id(id, username, avatar)
                `)
                .eq('match_id', matchId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting match details:', error);
            throw error;
        }
    },

    async verifyMatchResult(resultId, adminId, isApproved, notes = '') {
        try {
            const status = isApproved ? 'verified' : 'rejected';
            
            const { data, error } = await supabase
                .from('match_results')
                .update({
                    status: status,
                    verified_by: adminId,
                    verification_notes: notes,
                    verified_at: new Date()
                })
                .eq('id', resultId)
                .select();

            if (error) throw error;

            // If approved, update player stats
            if (isApproved) {
                await this.updatePlayerStatsFromResult(data[0]);
            }

            showNotification(`Match result ${status}`, 'success');
            return data[0];
        } catch (error) {
            console.error('Error verifying match result:', error);
            throw error;
        }
    },

    async updatePlayerStatsFromResult(result) {
        try {
            // Update winner stats
            const { data: winnerData } = await supabase
                .from('users')
                .select('wins, points')
                .eq('id', result.winner_id)
                .single();

            if (winnerData) {
                await supabase
                    .from('users')
                    .update({
                        wins: (winnerData.wins || 0) + 1,
                        points: (winnerData.points || 0) + 100
                    })
                    .eq('id', result.winner_id);
            }

            // Update loser stats (add participation points)
            const { data: loserData } = await supabase
                .from('users')
                .select('points')
                .eq('id', result.loser_id)
                .single();

            if (loserData) {
                await supabase
                    .from('users')
                    .update({
                        points: (loserData.points || 0) + 25
                    })
                    .eq('id', result.loser_id);
            }
        } catch (error) {
            console.error('Error updating player stats:', error);
        }
    },

    async getTournamentFinalStandings(tournamentId) {
        try {
            const { data, error } = await supabase
                .from('match_results')
                .select('winner_id, loser_id')
                .eq('tournament_id', tournamentId)
                .eq('status', 'verified');

            if (error) throw error;

            // Calculate standings
            const standings = {};
            data.forEach(result => {
                standings[result.winner_id] = (standings[result.winner_id] || 0) + 1;
                if (!standings[result.loser_id]) standings[result.loser_id] = 0;
            });

            // Get user details and sort by wins
            const sortedIds = Object.keys(standings).sort((a, b) => standings[b] - standings[a]);
            
            const { data: users } = await supabase
                .from('users')
                .select('id, username, avatar')
                .in('id', sortedIds);

            return users.map((user, index) => ({
                rank: index + 1,
                ...user,
                wins: standings[user.id]
            }));
        } catch (error) {
            console.error('Error getting final standings:', error);
            return [];
        }
    },

    async disputeResult(resultId, reason, evidence = []) {
        try {
            const { data, error } = await supabase
                .from('result_disputes')
                .insert([
                    {
                        result_id: resultId,
                        reason: reason,
                        evidence: evidence,
                        status: 'open',
                        filed_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            showNotification('Dispute filed. Admins will review shortly.', 'success');
            return data[0];
        } catch (error) {
            console.error('Error filing dispute:', error);
            throw error;
        }
    }
};