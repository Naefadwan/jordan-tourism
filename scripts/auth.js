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
        let otpSent = false;
        const submitBtn = document.getElementById('signup-submit-btn');
        const otpGroup = document.getElementById('otp-group');
        const companyFields = document.getElementById('company-fields');
        const accountTypeRadios = signupForm.querySelectorAll('input[name="accountType"]');

        // Handle account type toggle
        accountTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'business') {
                    companyFields.style.display = 'block';
                    // Make company fields required
                    document.getElementById('companyName').required = true;
                    document.getElementById('businessLicense').required = true;
                    document.getElementById('phone').required = true;
                    document.getElementById('address').required = true;
                } else {
                    companyFields.style.display = 'none';
                    // Make company fields optional
                    document.getElementById('companyName').required = false;
                    document.getElementById('businessLicense').required = false;
                    document.getElementById('phone').required = false;
                    document.getElementById('address').required = false;
                }
            });
        });

        function validatePassword(password) {
            const minLength = 8;
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasDigit = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (password.length < minLength) return 'Password must be at least 8 characters long.';
            if (!hasUpper) return 'Password must contain at least one uppercase letter.';
            if (!hasLower) return 'Password must contain at least one lowercase letter.';
            if (!hasDigit) return 'Password must contain at least one number.';
            if (!hasSpecial) return 'Password must contain at least one special character.';
            return null;
        }

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();

            const fullName = signupForm.fullName.value.trim();
            const email = signupForm.email.value.trim();
            const password = signupForm.password.value;
            const otp = signupForm.otp ? signupForm.otp.value.trim() : '';
            const accountType = signupForm.querySelector('input[name="accountType"]:checked').value;

            if (!fullName || !email || !password) {
                showError('Please fill in all fields.');
                return;
            }

            // Phase 1: Pre-OTP Validation (including password complexity)
            if (!otpSent) {
                const passwordError = validatePassword(password);
                if (passwordError) {
                    showError(passwordError);
                    return;
                }
            }

            try {
                if (!otpSent) {
                    // Phase 1: Send OTP
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';

                    await api('/auth/send-otp', {
                        method: 'POST',
                        body: { email, accountType },
                    });

                    otpSent = true;
                    otpGroup.style.display = 'block';
                    submitBtn.textContent = 'Verify & Register';
                    submitBtn.disabled = false;

                    // Disable other fields
                    signupForm.fullName.disabled = true;
                    signupForm.email.disabled = true;
                    signupForm.password.disabled = true;

                    // Disable account type selection
                    accountTypeRadios.forEach(radio => radio.disabled = true);

                    // Disable company fields if visible
                    if (accountType === 'business') {
                        document.getElementById('companyName').disabled = true;
                        document.getElementById('businessLicense').disabled = true;
                        document.getElementById('phone').disabled = true;
                        document.getElementById('address').disabled = true;
                    }
                } else {
                    // Phase 2: Verify & Register
                    if (!otp) {
                        showError('Please enter the OTP.');
                        return;
                    }

                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Registering...';

                    // Get account type and company fields
                    const body = { fullName, email, password, otp, accountType };

                    // Add company fields if business account
                    if (accountType === 'business') {
                        body.companyName = signupForm.companyName.value.trim();
                        body.businessLicense = signupForm.businessLicense.value.trim();
                        body.phone = signupForm.phone.value.trim();
                        body.address = signupForm.address.value.trim();

                        // Validate company fields
                        if (!body.companyName || !body.businessLicense || !body.phone || !body.address) {
                            showError('Please fill in all company fields.');
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Verify & Register';
                            return;
                        }
                    }

                    const registerResponse = await api('/auth/register', {
                        method: 'POST',
                        body,
                    });

                    // Check if company account that requires approval
                    if (registerResponse.requiresApproval) {
                        alert('Your company account has been registered successfully! Your account is pending admin approval. You will be notified once approved.');
                        window.location.href = 'login.html';
                        return;
                    }

                    // Regular user - log in immediately
                    const loginData = await api('/auth/login', {
                        method: 'POST',
                        body: { email, password },
                    });

                    localStorage.setItem('token', loginData.token);
                    localStorage.setItem('user', JSON.stringify(loginData.user));
                    window.location.href = 'profile.html';
                }
            } catch (err) {
                console.error('Signup failed:', err);
                showError(err.message || 'Signup failed.');
                submitBtn.disabled = false;
                if (!otpSent) submitBtn.textContent = 'Send OTP';
                else submitBtn.textContent = 'Verify & Register';
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

                if (data.user.role === 'company') {
                    window.location.href = 'company-dashboard.html';
                } else if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'profile.html';
                }
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
            const [roomBookings, attractionBookings, packageBookings] = await Promise.all([
                api('/bookings/my-bookings', { auth: true }).catch(() => []),
                api('/attraction-bookings/my-bookings', { auth: true }).catch(() => []),
                api('/package-bookings/my-bookings', { auth: true }).catch(() => [])
            ]);

            const allBookings = [
                ...(roomBookings || []).map(b => ({ ...b, type: 'accommodation' })),
                ...(attractionBookings || []).map(b => ({ ...b, type: 'attraction' })),
                ...(packageBookings || []).map(b => ({ ...b, type: 'package' }))
            ];

            if (allBookings.length === 0) {
                if (noBookingsMessage) noBookingsMessage.style.display = 'block';
                return;
            }

            if (noBookingsMessage) noBookingsMessage.style.display = 'none';
            profileBookingsGrid.innerHTML = '';

            // Sort by date (desc)
            allBookings.sort((a, b) => {
                const dateA = new Date(a.check_in_date || a.booking_date || a.start_date);
                const dateB = new Date(b.check_in_date || b.booking_date || b.start_date);
                return dateB - dateA;
            });

            allBookings.forEach((booking) => {
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

        // Normalize Data
        let imageSrc, titleText, dateText, typeLabel;

        if (booking.type === 'attraction') {
            imageSrc = booking.attraction_image || booking.image_url;
            titleText = booking.attraction_name || booking.name || booking.item_name;
            dateText = new Date(booking.booking_date).toLocaleDateString();
            typeLabel = 'Attraction';
        } else if (booking.type === 'package') {
            imageSrc = booking.package_image || booking.image_url;
            titleText = booking.package_name || booking.name || booking.item_name;
            dateText = `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}`;
            typeLabel = 'Travel Package';
        } else {
            imageSrc = booking.accommodation_image || booking.image_url;
            titleText = booking.accommodation_name || booking.name || booking.item_name;
            dateText = `${new Date(booking.check_in_date).toLocaleDateString()} - ${new Date(booking.check_out_date).toLocaleDateString()}`;
            typeLabel = 'Stay';
        }

        // Fix image paths - normalize slashes first
        if (imageSrc) {
            imageSrc = imageSrc.replace(/\\/g, '/');
            if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('public/')) {
                imageSrc = 'public/' + imageSrc;
            }
        }

        // Fallback for missing titles
        if (!titleText || titleText.trim() === '') {
            titleText = 'Jordan Exploration';
        }

        const img = document.createElement('img');
        img.src = imageSrc || 'public/placeholder.jpg';
        img.alt = titleText || 'Booking';
        img.className = 'booking-card-image';
        img.onerror = () => { img.src = 'public/placeholder.jpg'; };

        const content = document.createElement('div');
        content.className = 'booking-card-content';

        const type = document.createElement('span');
        type.className = 'booking-card-type';
        type.textContent = typeLabel;

        const title = document.createElement('h3');
        title.className = 'booking-card-title';
        title.textContent = titleText;

        const dates = document.createElement('p');
        dates.className = 'booking-card-dates';
        dates.textContent = dateText;

        const ref = document.createElement('p');
        ref.className = 'booking-card-ref';
        ref.textContent = `Ref: ${booking.booking_reference}`;

        const status = document.createElement('div');
        status.className = `booking-card-status status-${booking.status}`;
        status.textContent = booking.status;

        content.appendChild(type);
        content.appendChild(title);
        content.appendChild(dates);
        content.appendChild(ref);
        content.appendChild(status);

        card.appendChild(img);
        card.appendChild(content);

        // Add click listener for details
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => showBookingDetails(booking));

        return card;
    }

    function showBookingDetails(booking) {
        const modal = document.getElementById('bookingDetailsModal');
        const content = document.getElementById('bookingDetailsContent');
        if (!modal || !content) return;

        // Re-normalize for modal view
        let imageSrc, titleText, typeLabel, detailsHtml = '';

        if (booking.type === 'attraction') {
            imageSrc = booking.attraction_image || booking.image_url;
            titleText = booking.attraction_name || booking.name || booking.item_name;
            typeLabel = 'Attraction';
            detailsHtml = `
                <div class="detail-item">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${new Date(booking.booking_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Guests</span>
                    <span class="detail-value">${booking.num_guests || booking.guests || 1} Person(s)</span>
                </div>
            `;
        } else if (booking.type === 'package') {
            imageSrc = booking.package_image || booking.image_url;
            titleText = booking.package_name || booking.name || booking.item_name;
            typeLabel = 'Travel Package';
            detailsHtml = `
                <div class="detail-item">
                    <span class="detail-label">Start Date</span>
                    <span class="detail-value">${new Date(booking.start_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">End Date</span>
                    <span class="detail-value">${new Date(booking.end_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Guests</span>
                    <span class="detail-value">${booking.guests} Person(s)</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Include Ticket</span>
                    <span class="detail-value">${booking.has_ticket ? 'Yes' : 'No'}</span>
                </div>
            `;
        } else {
            imageSrc = booking.accommodation_image || booking.image_url;
            titleText = booking.accommodation_name || booking.name || booking.item_name;
            typeLabel = 'Stay';
            detailsHtml = `
                <div class="detail-item">
                    <span class="detail-label">Check-in</span>
                    <span class="detail-value">${new Date(booking.check_in_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Check-out</span>
                    <span class="detail-value">${new Date(booking.check_out_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Guests</span>
                    <span class="detail-value">${booking.num_guests || booking.guests || 1} Person(s)</span>
                </div>
            `;
        }

        // Fix image paths
        if (imageSrc) {
            imageSrc = imageSrc.replace(/\\/g, '/');
            if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('public/')) {
                imageSrc = 'public/' + imageSrc;
            }
        }

        content.innerHTML = `
            <div class="booking-details-header">
                <img src="${imageSrc || 'public/placeholder.jpg'}" alt="${titleText}">
            </div>
            <div class="booking-details-info">
                <span class="booking-details-type">${typeLabel}</span>
                <h3 class="booking-details-title">${titleText || 'Jordan Exploration'}</h3>
                
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Reference</span>
                        <span class="detail-value">#${booking.booking_reference}</span>
                    </div>
                    ${detailsHtml}
                </div>

                <div class="booking-details-footer">
                    <div class="booking-details-price">$${parseFloat(booking.total_price).toFixed(2)}</div>
                    <div class="booking-details-status status-${booking.status}">${booking.status}</div>
                </div>
            </div>
        `;

        modal.style.display = 'block';

        // Close logic
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = 'none';
        };
    }
});
