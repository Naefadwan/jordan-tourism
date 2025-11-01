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
            const profileBookingsGrid = document.getElementById('profileBookingsGrid');

            if (user) {
                document.getElementById('welcome-message').textContent = `Welcome, ${user.full_name}!`;
                document.getElementById('profile-email').textContent = user.email;
            }

            // Fetch and display user's bookings
            if (profileBookingsGrid) {
                fetchMyBookings(token);
            }
        }
    }
});

async function fetchMyBookings(token) {
    const API_URL = 'http://localhost:5000/api';
    const grid = document.getElementById('profileBookingsGrid');
    const noBookingsMessage = document.getElementById('no-bookings-message');

    try {
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: { 'x-auth-token': token }
        });

        if (!response.ok) throw new Error('Failed to fetch bookings');
        const bookings = await response.json();

        if (bookings.length === 0) {
            noBookingsMessage.style.display = 'block';
        } else {
            grid.innerHTML = ''; // Clear placeholder
            bookings.forEach(booking => {
                const card = createBookingCard(booking);
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        grid.innerHTML = '<p>Could not load your bookings. Please try again later.</p>';
    }
}

function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-summary-card';
    
    const img = document.createElement('img');
    img.src = booking.accommodation_image || 'public/placeholder-image.jpg';
    img.alt = booking.accommodation_name || 'Accommodation';
    img.className = 'booking-card-image';
    
    const content = document.createElement('div');
    content.className = 'booking-card-content';
    
    const title = document.createElement('h3');
    title.className = 'booking-card-title';
    title.textContent = booking.accommodation_name;
    
    const dates = document.createElement('p');
    dates.className = 'booking-card-dates';
    dates.textContent = `${new Date(booking.check_in_date).toLocaleDateString()} - ${new Date(booking.check_out_date).toLocaleDateString()}`;
    
    const ref = document.createElement('p');
    ref.className = 'booking-card-ref';
    ref.textContent = `Ref: ${booking.booking_reference}`;
    
    const status = document.createElement('div');
    status.className = `booking-card-status status-${booking.status}`;
    status.textContent = booking.status;
    
    content.appendChild(title);
    content.appendChild(dates);
    content.appendChild(ref);
    content.appendChild(status);
    
    card.appendChild(img);
    card.appendChild(content);
    
    return card;
}