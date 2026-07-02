// Friend System

const FriendSystem = {
    async sendFriendRequest(userId, targetUserId) {
        try {
            // Check if already friends
            const existing = await this.checkFriendship(userId, targetUserId);
            if (existing) {
                showNotification('Already friends or request pending', 'error');
                return null;
            }

            const { data, error } = await supabase
                .from('friend_requests')
                .insert([
                    {
                        sender_id: userId,
                        receiver_id: targetUserId,
                        status: 'pending',
                        sent_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            showNotification('Friend request sent!', 'success');
            return data[0];
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    },

    async acceptFriendRequest(requestId) {
        try {
            const { data, error } = await supabase
                .from('friend_requests')
                .update({ status: 'accepted', accepted_at: new Date() })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw error;

            // Add to friends table
            await supabase
                .from('friends')
                .insert([
                    {
                        user_id: data.sender_id,
                        friend_id: data.receiver_id,
                        added_at: new Date()
                    },
                    {
                        user_id: data.receiver_id,
                        friend_id: data.sender_id,
                        added_at: new Date()
                    }
                ]);

            showNotification('Friend request accepted!', 'success');
            return data;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    },

    async rejectFriendRequest(requestId) {
        try {
            const { error } = await supabase
                .from('friend_requests')
                .update({ status: 'rejected', rejected_at: new Date() })
                .eq('id', requestId);

            if (error) throw error;
            showNotification('Friend request rejected', 'success');
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            throw error;
        }
    },

    async removeFriend(userId, friendId) {
        try {
            await supabase
                .from('friends')
                .delete()
                .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

            showNotification('Friend removed', 'success');
        } catch (error) {
            console.error('Error removing friend:', error);
            throw error;
        }
    },

    async getFriendsList(userId) {
        try {
            const { data, error } = await supabase
                .from('friends')
                .select(`
                    *,
                    friend:friend_id(id, username, avatar, points, wins)
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting friends list:', error);
            return [];
        }
    },

    async getPendingFriendRequests(userId) {
        try {
            const { data, error } = await supabase
                .from('friend_requests')
                .select(`
                    *,
                    sender:sender_id(id, username, avatar)
                `)
                .eq('receiver_id', userId)
                .eq('status', 'pending');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting friend requests:', error);
            return [];
        }
    },

    async checkFriendship(userId, targetUserId) {
        try {
            const { data, error } = await supabase
                .from('friends')
                .select('id')
                .eq('user_id', userId)
                .eq('friend_id', targetUserId)
                .single();

            return !error && data !== null;
        } catch (error) {
            return false;
        }
    },

    displayFriendsList(friends) {
        const container = document.createElement('div');
        container.className = 'friends-list';

        if (friends.length === 0) {
            container.innerHTML = '<p>No friends yet. Send friend requests!</p>';
            return container;
        }

        const friendsHTML = friends.map(friendship => `
            <div class="friend-item">
                <div class="friend-info">
                    <img src="${friendship.friend.avatar || 'https://via.placeholder.com/40'}" alt="${friendship.friend.username}" class="friend-avatar">
                    <div class="friend-details">
                        <span class="friend-name">${friendship.friend.username}</span>
                        <span class="friend-stats">🏆 ${friendship.friend.wins} wins | ${friendship.friend.points} pts</span>
                    </div>
                </div>
                <button class="btn-small" onclick="FriendSystem.removeFriend('${friendship.user_id}', '${friendship.friend_id}')">Remove</button>
            </div>
        `).join('');

        container.innerHTML = friendsHTML;
        return container;
    }
};