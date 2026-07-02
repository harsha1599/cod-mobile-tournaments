// Tournament Streaming Integration

const StreamingIntegration = {
    // Twitch Integration
    twitch: {
        async startStream(tournamentId, channelUrl) {
            try {
                const { data, error } = await supabase
                    .from('tournament_streams')
                    .insert([
                        {
                            tournament_id: tournamentId,
                            platform: 'twitch',
                            channel_url: channelUrl,
                            status: 'live',
                            started_at: new Date()
                        }
                    ])
                    .select();

                if (error) throw error;
                showNotification('Stream started!', 'success');
                return data[0];
            } catch (error) {
                console.error('Error starting Twitch stream:', error);
                throw error;
            }
        },

        async getStreamViewer(streamId) {
            return `<iframe src="https://player.twitch.tv/?channel=${streamId}&parent=${window.location.hostname}" 
                            height="720" width="100%" allowfullscreen></iframe>`;
        }
    },

    // YouTube Live Integration
    youtube: {
        async startStream(tournamentId, videoId) {
            try {
                const { data, error } = await supabase
                    .from('tournament_streams')
                    .insert([
                        {
                            tournament_id: tournamentId,
                            platform: 'youtube',
                            video_id: videoId,
                            status: 'live',
                            started_at: new Date()
                        }
                    ])
                    .select();

                if (error) throw error;
                showNotification('YouTube stream linked!', 'success');
                return data[0];
            } catch (error) {
                console.error('Error linking YouTube stream:', error);
                throw error;
            }
        },

        async getStreamViewer(videoId) {
            return `<iframe width="100%" height="720" src="https://www.youtube.com/embed/${videoId}" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>`;
        }
    },

    // Facebook Live Integration
    facebook: {
        async startStream(tournamentId, videoUrl) {
            try {
                const { data, error } = await supabase
                    .from('tournament_streams')
                    .insert([
                        {
                            tournament_id: tournamentId,
                            platform: 'facebook',
                            video_url: videoUrl,
                            status: 'live',
                            started_at: new Date()
                        }
                    ])
                    .select();

                if (error) throw error;
                showNotification('Facebook stream linked!', 'success');
                return data[0];
            } catch (error) {
                console.error('Error linking Facebook stream:', error);
                throw error;
            }
        }
    },

    async getTournamentStreams(tournamentId) {
        try {
            const { data, error } = await supabase
                .from('tournament_streams')
                .select('*')
                .eq('tournament_id', tournamentId)
                .eq('status', 'live');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting tournament streams:', error);
            return [];
        }
    },

    async endStream(streamId) {
        try {
            const { data, error } = await supabase
                .from('tournament_streams')
                .update({
                    status: 'ended',
                    ended_at: new Date()
                })
                .eq('id', streamId)
                .select();

            if (error) throw error;
            showNotification('Stream ended', 'success');
            return data[0];
        } catch (error) {
            console.error('Error ending stream:', error);
            throw error;
        }
    },

    async getViewerCount(streamId) {
        try {
            const { data, error } = await supabase
                .from('stream_views')
                .select('viewer_count')
                .eq('stream_id', streamId)
                .single();

            if (error) throw error;
            return data?.viewer_count || 0;
        } catch (error) {
            return 0;
        }
    },

    async recordStreamView(streamId, userId) {
        try {
            const { error } = await supabase
                .from('stream_viewers')
                .insert([
                    {
                        stream_id: streamId,
                        user_id: userId,
                        watched_at: new Date()
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Error recording stream view:', error);
        }
    }
};