// Supabase Client Initialization
let supabase = null;

function initSupabase() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('Supabase credentials not configured');
        return;
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
}

// Initialize Supabase when document loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}

// User Database Functions
const UserDB = {
    async createUser(email, username, gameId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        email,
                        username,
                        game_id: gameId,
                        wins: 0,
                        points: 0,
                        tournaments_played: 0
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async getUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    },

    async updateUserStats(userId, wins, points) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    wins: wins,
                    points: points,
                    updated_at: new Date()
                })
                .eq('id', userId)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }
};

// Tournament Database Functions
const TournamentDB = {
    async getTournaments() {
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting tournaments:', error);
            return [];
        }
    },

    async getTournamentById(tournamentId) {
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .eq('id', tournamentId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting tournament:', error);
            throw error;
        }
    },

    async createTournament(tournamentData) {
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .insert([tournamentData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating tournament:', error);
            throw error;
        }
    }
};

// Registration Database Functions
const RegistrationDB = {
    async registerTournament(userId, tournamentId, paymentId) {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .insert([
                    {
                        user_id: userId,
                        tournament_id: tournamentId,
                        payment_id: paymentId,
                        status: 'active'
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error registering tournament:', error);
            throw error;
        }
    },

    async getUserRegistrations(userId) {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select(`
                    *,
                    tournaments:tournament_id(*)
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting registrations:', error);
            return [];
        }
    }
};

// Leaderboard Database Functions
const LeaderboardDB = {
    async getLeaderboard(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, wins, points, tournaments_played')
                .order('points', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }
};