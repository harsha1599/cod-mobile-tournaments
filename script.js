// Main Application Script

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking X or outside modal
document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal.id);
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (AuthManager.isAuthenticated()) {
                document.getElementById('tournaments').scrollIntoView({ behavior: 'smooth' });
            } else {
                openModal('authModal');
            }
        });
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#00d084' : type === 'error' ? '#ff0000' : '#FFB81C'};
        color: ${type === 'success' || type === 'error' ? 'white' : '#000'};
        border-radius: 5px;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Dashboard
function showDashboard() {
    if (!AuthManager.isAuthenticated()) {
        showNotification('Please login first', 'error');
        return;
    }

    loadUserDashboard();
    openModal('dashboardModal');
}

async function loadUserDashboard() {
    try {
        const user = AuthManager.getCurrentUser();
        const registrations = await RegistrationDB.getUserRegistrations(user.id);
        
        // Display registered tournaments
        const registeredList = document.getElementById('registeredList');
        if (registeredList) {
            if (registrations.length === 0) {
                registeredList.innerHTML = '<p style="text-align: center; color: #b0b0b0;">No tournaments registered yet.</p>';
            } else {
                registeredList.innerHTML = registrations.map(reg => `
                    <div style="
                        background: rgba(255, 184, 28, 0.1);
                        border: 1px solid #FFB81C;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border-radius: 5px;
                    ">
                        <h3 style="color: #FFB81C; margin-bottom: 0.5rem;">${reg.tournaments.name}</h3>
                        <p>Status: <strong>${reg.status}</strong></p>
                        <p>Registration Date: ${new Date(reg.created_at).toLocaleDateString()}</p>
                    </div>
                `).join('');
            }
        }

        // Display statistics (mock data)
        document.getElementById('totalWins').textContent = Math.floor(Math.random() * 50);
        document.getElementById('totalPoints').textContent = Math.floor(Math.random() * 5000);
        document.getElementById('tournamentsPlayed').textContent = registrations.length;
        document.getElementById('winRate').textContent = Math.floor(Math.random() * 100) + '%';
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard', 'error');
    }
}

// Logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthManager.logout();
            closeModal('dashboardModal');
        });
    }
});

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('CoD Mobile Tournaments loaded');
    updateAuthUI();
});