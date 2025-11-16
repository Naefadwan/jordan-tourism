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
    };

    const packageSummaryEl = document.getElementById('packageSummary');
    const summaryStartDateEl = document.getElementById('summaryStartDate');
    const summaryGuestsEl = document.getElementById('summaryGuests');
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

            summaryStartDateEl.textContent = new Date(state.startDate).toLocaleDateString();
            summaryGuestsEl.textContent = `${state.guests} traveler${state.guests > 1 ? 's' : ''}`;
        } catch (err) {
            console.error('Error loading package:', err);
            packageSummaryEl.innerHTML = `<p>Could not load package details. Please go back and try again.</p>`;
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
