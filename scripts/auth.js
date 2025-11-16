document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    function getErrorDiv() {
        return document.getElementById('signup-error') || document.getElementById('login-error');
    }

    function showError(message) {
        const errorDiv = getErrorDiv();
        if (!errorDiv) return;
        errorDiv.textContent = message;
        errorDiv.classList.add('visible');
    }

    function clearError() {
        const errorDiv = getErrorDiv();
        if (!errorDiv) return;
        errorDiv.textContent = '';
        errorDiv.classList.remove('visible');
    }

    // -------- SIGNUP --------
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();

            const fullName = signupForm.fullName.value.trim();
            const email = signupForm.email.value.trim();
            const password = signupForm.password.value;

            if (!fullName || !email || !password) {
                showError('Please fill in all fields.');
                return;
            }

            try {
                // 1) Register
                await api('/auth/register', {
                    method: 'POST',
                    body: { fullName, email, password },
                });

                // 2) Immediately log in
                const loginData = await api('/auth/login', {
                    method: 'POST',
                    body: { email, password },
                });

                localStorage.setItem('token', loginData.token);
                localStorage.setItem('user', JSON.stringify(loginData.user));
                window.location.href = 'profile.html';
            } catch (err) {
                console.error('Signup failed:', err);
                showError(err.message || 'Signup failed.');
            }
        });
    }

    // -------- LOGIN --------
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();

            const email = loginForm.email.value.trim();
            const password = loginForm.password.value;

            if (!email || !password) {
                showError('Please enter email and password.');
                return;
            }

            try {
                const data = await api('/auth/login', {
                    method: 'POST',
                    body: { email, password },
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'profile.html';
            } catch (err) {
                console.error('Login failed:', err);
                showError(err.message || 'Login failed.');
            }
        });
    }

    // -------- LOGOUT --------
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    // -------- PROFILE PAGE: PROTECT & LOAD DATA --------
    const welcomeMessage = document.getElementById('welcome-message');
    const profileEmail = document.getElementById('profile-email');
    const profileBookingsGrid = document.getElementById('profileBookingsGrid');
    const noBookingsMessage = document.getElementById('no-bookings-message');

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (welcomeMessage || profileEmail || profileBookingsGrid) {
        if (!token || !userStr) {
            // Not logged in, redirect
            window.location.href = 'login.html';
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${user.full_name || user.fullName || 'Traveler'}!`;
            if (profileEmail) profileEmail.textContent = user.email || '';
        } catch (err) {
            console.error('Error parsing user from localStorage', err);
        }

        // Load bookings
        if (profileBookingsGrid) {
            fetchMyBookings();
        }
    }

    async function fetchMyBookings() {
        try {
            const bookings = await api('/bookings/my-bookings', { auth: true });

            if (bookings.length === 0) {
                if (noBookingsMessage) noBookingsMessage.style.display = 'block';
                return;
            }

            if (noBookingsMessage) noBookingsMessage.style.display = 'none';
            profileBookingsGrid.innerHTML = '';

            bookings.forEach((booking) => {
                const card = createBookingCard(booking);
                profileBookingsGrid.appendChild(card);
            });
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            if (noBookingsMessage) {
                noBookingsMessage.textContent = 'Could not load bookings.';
                noBookingsMessage.style.display = 'block';
            }
        }
    }

    function createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'booking-card';

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
});