// In-app Messaging System

const MessagingSystem = {
    async sendMessage(senderId, receiverId, message, attachments = []) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    {
                        sender_id: senderId,
                        receiver_id: receiverId,
                        content: message,
                        attachments: attachments,
                        is_read: false,
                        sent_at: new Date()
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    async getConversation(userId, otherUserId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, username, avatar)
                `)
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
                .order('sent_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting conversation:', error);
            return [];
        }
    },

    async getConversationList(userId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, username, avatar),
                    receiver:receiver_id(id, username, avatar)
                `)
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('sent_at', { ascending: false });

            if (error) throw error;

            // Group by conversation
            const conversations = {};
            data.forEach(msg => {
                const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
                if (!conversations[otherUserId]) {
                    conversations[otherUserId] = {
                        otherUser: msg.sender_id === userId ? msg.receiver : msg.sender,
                        lastMessage: msg.content,
                        lastMessageTime: msg.sent_at,
                        unreadCount: 0
                    };
                }
                if (!msg.is_read && msg.receiver_id === userId) {
                    conversations[otherUserId].unreadCount++;
                }
            });

            return Object.values(conversations);
        } catch (error) {
            console.error('Error getting conversation list:', error);
            return [];
        }
    },

    async markAsRead(messageId) {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    },

    async deleteMessage(messageId) {
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;
            showNotification('Message deleted', 'success');
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    async getUnreadCount(userId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return data.length;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    },

    displayConversation(messages, currentUserId) {
        const container = document.createElement('div');
        container.className = 'chat-container';

        const chatHTML = messages.map(msg => `
            <div class="chat-message ${msg.sender_id === currentUserId ? 'sent' : 'received'}">
                <div class="message-content">
                    <p>${msg.content}</p>
                    <span class="message-time">${new Date(msg.sent_at).toLocaleTimeString()}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = chatHTML;
        return container;
    }
};