// scripts/package-booking.js
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';

    const params = new URLSearchParams(window.location.search);
    const state = {
        packageId: params.get('packageId'),
        startDate: params.get('startDate'),
        guests: Number(params.get('guests') || 2),
        clientSecret: null,
        totalPrice: 0,
        basePrice: 0,
        hasTicket: false,
        ticketPrice: 0,
        includeTicket: params.get('includeTicket') === 'true',
        ticketDate: params.get('ticketDate') || ''
    };

    const packageSummaryEl = document.getElementById('packageSummary');
    const summaryStartDateInput = document.getElementById('summaryStartDateInput');
    const summaryGuestsInput = document.getElementById('summaryGuestsInput');
    const summaryTotalPriceEl = document.getElementById('summaryTotalPrice');
    const paymentForm = document.getElementById('payment-form');
    const paymentMessage = document.getElementById('payment-message');
    const submitButton = document.getElementById('submit-payment');
    const successState = document.getElementById('successState');
    const bookingRefEl = document.getElementById('packageBookingRef');

    let stripe = null;
    let elements = null;

    // --- Auth guard ---
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to complete your booking.');
        window.location.href = 'login.html';
        return;
    }

    // --- Ensure we have booking details in the URL ---
    if (!state.packageId || !state.startDate) {
        alert('Missing package booking details. Please start again from the package details page.');
        window.location.href = 'packages.html';
        return;
    }

    // --- Helpers ---
    function showError(message) {
        if (!paymentMessage) return;
        paymentMessage.textContent = message;
        paymentMessage.classList.add('visible');
    }

    function clearError() {
        if (!paymentMessage) return;
        paymentMessage.textContent = '';
        paymentMessage.classList.remove('visible');
    }

    function setLoading(isLoading) {
        if (!submitButton) return;
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Processing...' : 'Pay & Confirm Booking';
    }

    function extractPaymentIntentIdFromClientSecret(clientSecret) {
        if (!clientSecret || typeof clientSecret !== 'string') return null;
        const secretIndex = clientSecret.lastIndexOf('_secret_');
        return secretIndex > -1 ? clientSecret.substring(0, secretIndex) : null;
    }

    // --- Step 1: Load package summary for UI ---
    async function loadPackageSummary() {
        try {
            const res = await fetch(`${API_URL}/packages/${state.packageId}`);
            if (!res.ok) throw new Error('Failed to fetch package details');
            const pkg = await res.json();

            packageSummaryEl.innerHTML = `
                <h2>${pkg.name}</h2>
                <p>${pkg.description}</p>
                <p class="small-text">
                    ${pkg.nights} nights · ${pkg.originCity} → ${pkg.destinationCity}
                </p>
            `;

            // Initialize inputs
            if (state.startDate) {
                // Ensure date is in YYYY-MM-DD format
                summaryStartDateInput.value = new Date(state.startDate).toISOString().split('T')[0];
            }
            summaryGuestsInput.value = state.guests;

            // Handle Start Date Change
            summaryStartDateInput.addEventListener('change', (e) => {
                if (!e.target.value) return;
                state.startDate = e.target.value;
                if (state.hasTicket) updateTicketConstraints(pkg);
                updatePaymentIntent();
            });

            // Handle Guests Change
            summaryGuestsInput.addEventListener('change', (e) => {
                const val = parseInt(e.target.value);
                if (val && val > 0) {
                    state.guests = val;
                    updatePriceDisplay();
                    updatePaymentIntent();
                }
            });

            state.basePrice = parseFloat(pkg.from_price);
            state.hasTicket = pkg.has_ticket;
            state.ticketPrice = parseFloat(pkg.ticket_price || 0);

            if (state.hasTicket) {
                const ticketWrapper = document.getElementById('ticketOptionWrapper');
                const ticketPriceSpan = document.getElementById('ticketPricePerPerson');
                if (ticketWrapper) ticketWrapper.style.display = 'block';
                if (ticketPriceSpan) ticketPriceSpan.textContent = state.ticketPrice;

                const ticketCheckbox = document.getElementById('includeTicket');
                const ticketDateWrapper = document.getElementById('ticketDateWrapper');
                const ticketDateInput = document.getElementById('ticketDateInput');

                // Set min/max dates for ticket based on package dates
                if (state.startDate && pkg.nights) {
                    const start = new Date(state.startDate);
                    const end = new Date(start);
                    end.setDate(end.getDate() + pkg.nights);

                    ticketDateInput.min = start.toISOString().split('T')[0];
                    ticketDateInput.max = end.toISOString().split('T')[0];
                }

                // Initialize ticket UI state based on URL params
                if (state.includeTicket) {
                    ticketCheckbox.checked = true;
                    ticketDateWrapper.style.display = 'block';
                    if (state.ticketDate) {
                        ticketDateInput.value = state.ticketDate;
                    }
                }

                ticketCheckbox.addEventListener('change', (e) => {
                    state.includeTicket = e.target.checked;
                    ticketDateWrapper.style.display = state.includeTicket ? 'block' : 'none';
                    if (!state.includeTicket) {
                        state.ticketDate = '';
                        ticketDateInput.value = '';
                    }
                    updatePaymentIntent();
                });

                ticketDateInput.addEventListener('change', (e) => {
                    state.ticketDate = e.target.value;
                });

                updateTicketConstraints(pkg);
            }

            function updateTicketConstraints(pkg) {
                const ticketDateInput = document.getElementById('ticketDateInput');
                if (state.startDate && pkg.nights && ticketDateInput) {
                    const start = new Date(state.startDate);
                    const end = new Date(start);
                    end.setDate(end.getDate() + pkg.nights);

                    ticketDateInput.min = start.toISOString().split('T')[0];
                    ticketDateInput.max = end.toISOString().split('T')[0];

                    // Clear date if it falls out of new range
                    if (state.ticketDate) {
                        const current = new Date(state.ticketDate);
                        if (current < start || current > end) {
                            state.ticketDate = '';
                            ticketDateInput.value = '';
                        }
                    }
                }
            }
            updatePriceDisplay();
        } catch (err) {
            console.error('Error loading package:', err);
            packageSummaryEl.innerHTML = `<p>Could not load package details. Please go back and try again.</p>`;
        }
    }

    function updatePriceDisplay() {
        const ticketTotal = state.includeTicket ? (state.ticketPrice * state.guests) : 0;
        state.totalPrice = (state.basePrice * state.guests) + ticketTotal;
        summaryTotalPriceEl.textContent = `$${state.totalPrice.toFixed(2)}`;
    }

    async function updatePaymentIntent() {
        // If Stripe elements are already initialized, we might need a slightly different flow,
        // but for now, re-running initializeStripe will refresh the element with the new amount.
        if (!state.clientSecret) return;
        setLoading(true);
        try {
            updatePriceDisplay();
            await initializeStripe();
        } catch (err) {
            console.error('Error updating payment intent:', err);
        } finally {
            setLoading(false);
        }
    }

    // --- Step 2: Initialize Stripe Payment Element ---
    async function initializeStripe() {
        try {
            clearError();
            setLoading(true);

            // 1) Get publishable key from backend
            const configResponse = await fetch(`${API_URL}/config`);
            if (!configResponse.ok) {
                const errData = await configResponse.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to load payment configuration.');
            }

            const { publishableKey } = await configResponse.json();
            if (!publishableKey || typeof publishableKey !== 'string' || !publishableKey.trim()) {
                throw new Error('Stripe publishable key is missing or invalid.');
            }

            stripe = Stripe(publishableKey);

            // 2) Create PaymentIntent for this package booking
            const intentResponse = await fetch(`${API_URL}/package-bookings/payments/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({
                    packageId: state.packageId,
                    startDate: state.startDate,
                    guests: state.guests,
                    includeTicket: state.includeTicket
                }),
            });

            if (!intentResponse.ok) {
                const errData = await intentResponse.json().catch(() => ({ message: 'Failed to create payment intent' }));
                throw new Error(errData.message || 'Failed to create payment intent.');
            }

            const { clientSecret, totalPrice } = await intentResponse.json();
            if (!clientSecret) {
                throw new Error('Payment intent created but no client secret returned.');
            }

            state.clientSecret = clientSecret;
            state.totalPrice = totalPrice || 0;

            summaryTotalPriceEl.textContent = `$${state.totalPrice.toFixed(2)}`;

            // 3) Mount Payment Element
            elements = stripe.elements({ clientSecret });
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');
        } catch (err) {
            console.error('Error initializing Stripe:', err);
            showError(err.message || 'Could not initialize payment.');
        } finally {
            setLoading(false);
        }
    }

    // --- Step 3: Handle form submission (confirm payment + create booking) ---
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearError();

            if (!stripe || !elements || !state.clientSecret) {
                showError('Payment system is not initialized. Please refresh and try again.');
                return;
            }

            if (state.includeTicket && !state.ticketDate) {
                showError('Please select a date for your flight tickets.');
                return;
            }

            setLoading(true);

            try {
                const { error: stripeError } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: window.location.href,
                    },
                    redirect: 'if_required',
                });

                if (stripeError) {
                    showError(stripeError.message || 'Payment could not be completed.');
                    return;
                }

                const paymentIntentId = extractPaymentIntentIdFromClientSecret(state.clientSecret);

                const response = await fetch(`${API_URL}/package-bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                    body: JSON.stringify({
                        packageId: state.packageId,
                        startDate: state.startDate,
                        guests: state.guests,
                        paymentIntentId,
                        paymentIntentId,
                        includeTicket: state.includeTicket,
                        ticketDate: state.ticketDate
                    }),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || 'Failed to create package booking.');
                }

                const booking = await response.json();

                paymentForm.style.display = 'none';
                successState.style.display = 'block';
                if (bookingRefEl) {
                    bookingRefEl.textContent = booking.booking_reference || '(no reference)';
                }
            } catch (err) {
                console.error('Error completing package booking:', err);
                showError(err.message || 'Something went wrong while finalizing your booking.');
            } finally {
                setLoading(false);
            }
        });
    }

    // Kick everything off
    loadPackageSummary();
    initializeStripe();
});
