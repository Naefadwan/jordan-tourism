document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    async function handleAuthResponse(response) {
        const errorDiv = document.getElementById('signup-error') || document.getElementById('login-error');
        errorDiv.textContent = '';
        errorDiv.classList.remove('visible');

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.message || 'An unknown error occurred.';
            errorDiv.classList.add('visible');
            return false;
        }
        return data;
    }

    // --- SIGNUP ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = signupForm.fullName.value;
            const email = signupForm.email.value;
            const password = signupForm.password.value;

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, email, password }),
                });

                const data = await handleAuthResponse(response);
                if (data) {
                    // Automatically log in after successful registration
                    const loginResponse = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const loginData = await handleAuthResponse(loginResponse);
                    if (loginData && loginData.token) {
                        localStorage.setItem('token', loginData.token);
                        localStorage.setItem('user', JSON.stringify(loginData.user));
                        window.location.href = 'profile.html';
                    }
                }
            } catch (err) {
                console.error('Signup failed:', err);
            }
        });
    }

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await handleAuthResponse(response);
                if (data && data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'profile.html';
                }
            } catch (err) {
                console.error('Login failed:', err);
            }
        });
    }

    // --- LOGOUT ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    // --- PROFILE PAGE PROTECTION & DATA ---
    if (window.location.pathname.endsWith('profile.html')) {
        const token = localStorage.getItem('token');

        if (!token) {
            // Redirect to login if not logged in
            window.location.href = 'login.html';
        } else {
            // Populate profile page with user data
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                document.getElementById('welcome-message').textContent = `Welcome, ${user.full_name}!`;
                document.getElementById('profile-email').textContent = user.email;
            }
        }
    }
});

// This function will be called by main.js to update the header
function checkAuthState() {
    const authLink = document.getElementById("authLink");
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (authLink) {
        if (token && user) {
            const userData = JSON.parse(user);
            // Update icon to link to profile, using full_name from backend
            authLink.href = "profile.html";
            authLink.setAttribute('aria-label', `View profile for ${userData.full_name}`);
        } else {
            // Update icon to link to login
            authLink.href = "login.html";
            authLink.setAttribute('aria-label', 'Login or create an account');
        }
    }
}

// Run on every page load
checkAuthState();