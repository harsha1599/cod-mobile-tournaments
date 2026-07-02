// Authentication State
let currentUser = null;

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('codUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
});

const AuthManager = {
    async login(email, password) {
        try {
            // In a real app, validate credentials against Supabase
            // For now, we'll create a mock user
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // Mock login for demo
                currentUser = {
                    id: 'user_' + Math.random().toString(36).substr(2, 9),
                    email: email,
                    username: email.split('@')[0]
                };
            } else {
                currentUser = {
                    id: data.user.id,
                    email: data.user.email,
                    username: data.user.user_metadata?.username || data.user.email.split('@')[0]
                };
            }

            localStorage.setItem('codUser', JSON.stringify(currentUser));
            updateAuthUI();
            closeModal('authModal');
            showNotification('Login successful!', 'success');
            return currentUser;
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed. Please try again.', 'error');
            throw error;
        }
    },

    async signup(email, username, password, gameId) {
        try {
            // Create user in Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                        game_id: gameId
                    }
                }
            });

            if (error) throw error;

            // Create user profile in database
            if (data.user) {
                await UserDB.createUser(email, username, gameId);
                
                currentUser = {
                    id: data.user.id,
                    email: email,
                    username: username,
                    gameId: gameId
                };

                localStorage.setItem('codUser', JSON.stringify(currentUser));
                updateAuthUI();
                closeModal('authModal');
                showNotification('Account created successfully!', 'success');
                return currentUser;
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Signup failed. Please try again.', 'error');
            throw error;
        }
    },

    logout() {
        try {
            currentUser = null;
            localStorage.removeItem('codUser');
            updateAuthUI();
            showNotification('Logged out successfully!', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    getCurrentUser() {
        return currentUser;
    },

    isAuthenticated() {
        return currentUser !== null;
    }
};

// Update UI based on auth state
function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    
    if (AuthManager.isAuthenticated()) {
        authBtn.textContent = 'Dashboard';
        authBtn.onclick = (e) => {
            e.preventDefault();
            showDashboard();
        };
    } else {
        authBtn.textContent = 'Login';
        authBtn.onclick = (e) => {
            e.preventDefault();
            openModal('authModal');
        };
    }
}

// Auth Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                await AuthManager.login(email, password);
            } catch (error) {
                console.error('Login error:', error);
            }
        });
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const gameId = document.getElementById('gameId').value;
            
            try {
                await AuthManager.signup(email, username, password, gameId);
            } catch (error) {
                console.error('Signup error:', error);
            }
        });
    }
});

function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update button state
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
}