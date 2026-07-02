// Email Verification System

const EmailVerification = {
    async sendVerificationEmail(email, userId) {
        try {
            // Generate verification token
            const verificationToken = this.generateToken();
            
            // Store token in database
            await this.storeVerificationToken(userId, verificationToken, email);
            
            // In production, send actual email using service like SendGrid, Mailgun, etc.
            // For demo, we'll simulate with localStorage
            const verificationLink = `${window.location.origin}?verify=${verificationToken}`;
            
            console.log('Verification email sent to:', email);
            console.log('Verification link:', verificationLink);
            
            // Store in localStorage for demo purposes
            localStorage.setItem(`verification_${userId}`, verificationToken);
            
            showNotification('Verification email sent! Check your inbox.', 'success');
            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    },

    async verifyEmail(token) {
        try {
            // Find user with this verification token
            const userId = await this.findUserByToken(token);
            
            if (!userId) {
                showNotification('Invalid or expired verification link', 'error');
                return false;
            }

            // Update user's email_verified status in database
            const { data, error } = await supabase
                .from('users')
                .update({ email_verified: true, verified_at: new Date() })
                .eq('id', userId)
                .select();

            if (error) throw error;

            // Clear verification token
            localStorage.removeItem(`verification_${userId}`);
            
            showNotification('✅ Email verified successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error verifying email:', error);
            throw error;
        }
    },

    generateToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },

    async storeVerificationToken(userId, token, email) {
        try {
            const { error } = await supabase
                .from('email_verifications')
                .insert([
                    {
                        user_id: userId,
                        token: token,
                        email: email,
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Error storing verification token:', error);
        }
    },

    async findUserByToken(token) {
        try {
            const { data, error } = await supabase
                .from('email_verifications')
                .select('user_id, expires_at')
                .eq('token', token)
                .single();

            if (error || !data) return null;

            // Check if token is expired
            if (new Date(data.expires_at) < new Date()) {
                return null;
            }

            return data.user_id;
        } catch (error) {
            console.error('Error finding user by token:', error);
            return null;
        }
    },

    async checkEmailVerificationStatus(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('email_verified')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data?.email_verified || false;
        } catch (error) {
            console.error('Error checking verification status:', error);
            return false;
        }
    },

    async resendVerificationEmail(userId, email) {
        try {
            // Delete old tokens
            await supabase
                .from('email_verifications')
                .delete()
                .eq('user_id', userId);

            // Send new verification email
            await this.sendVerificationEmail(email, userId);
            showNotification('Verification email resent!', 'success');
        } catch (error) {
            console.error('Error resending verification email:', error);
            throw error;
        }
    }
};

// Check for verification token on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify');

    if (verifyToken) {
        EmailVerification.verifyEmail(verifyToken).then(success => {
            if (success) {
                setTimeout(() => {
                    window.location.href = window.location.origin;
                }, 2000);
            }
        });
    }
});