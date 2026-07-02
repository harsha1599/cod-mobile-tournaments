// Razorpay Payment Integration

const PaymentManager = {
    async initiatePayment(amount, tournamentId) {
        try {
            if (!RAZORPAY_KEY_ID) {
                showNotification('Payment gateway not configured', 'error');
                return;
            }

            const user = AuthManager.getCurrentUser();
            if (!user) {
                showNotification('Please login first', 'error');
                return;
            }

            // Create order on backend (in production, call your backend API)
            const orderId = 'order_' + Date.now();

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: amount * 100, // Convert to paise
                currency: 'INR',
                name: 'CoD Mobile Tournaments',
                description: `Tournament Registration - ${currentTournament.name}`,
                order_id: orderId,
                handler: async (response) => {
                    try {
                        await PaymentManager.verifyPayment(response, tournamentId);
                    } catch (error) {
                        showNotification('Payment verification failed', 'error');
                    }
                },
                prefill: {
                    name: user.username,
                    email: user.email
                },
                theme: {
                    color: '#FFB81C'
                },
                modal: {
                    ondismiss: () => {
                        showNotification('Payment cancelled', 'error');
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            showNotification('Payment failed: ' + error.message, 'error');
        }
    },

    async verifyPayment(response, tournamentId) {
        try {
            const user = AuthManager.getCurrentUser();
            
            // Register user for tournament
            const registration = await RegistrationDB.registerTournament(
                user.id,
                tournamentId,
                response.razorpay_payment_id
            );

            if (registration) {
                closeModal('paymentModal');
                showNotification('✅ Registration successful! You are now in the tournament.', 'success');
                
                // Reload leaderboard
                loadLeaderboard();
            }
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        }
    }
};

// Payment button event listener
document.addEventListener('DOMContentLoaded', () => {
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) {
        payNowBtn.addEventListener('click', () => {
            if (!currentTournament) return;
            
            // Extract amount from entry fee (remove currency symbol and convert to number)
            const amount = parseInt(currentTournament.entryFee.replace(/[^0-9]/g, ''));
            PaymentManager.initiatePayment(amount, currentTournament.id);
        });
    }
});