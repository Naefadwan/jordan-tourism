document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';

    // Get params
    const params = new URLSearchParams(window.location.search);
    const attractionId = params.get('attractionId');
    const date = params.get('date');
    const guests = parseInt(params.get('guests') || '1');

    if (!attractionId || !date) {
        alert('Invalid booking details. Redirecting to attractions.');
        window.location.href = 'attractions.html';
        return;
    }

    // UI Elements
    const attractionSummaryEl = document.getElementById('attractionSummary');
    const summaryDateEl = document.getElementById('summaryDate');
    const summaryGuestsEl = document.getElementById('summaryGuests');
    const summaryPricePerPersonEl = document.getElementById('summaryPricePerPerson');
    const summaryTotalPriceEl = document.getElementById('summaryTotalPrice');
    const payAmountBtnEl = document.getElementById('payAmountBtn');
    const paymentForm = document.getElementById('payment-form');
    const paymentMessage = document.getElementById('payment-message');
    const submitButton = document.getElementById('submit-payment');
    const successState = document.getElementById('successState');
    const bookingRefEl = document.getElementById('bookingRef');

    let stripe;
    let elements;
    let clientSecret;
    let attractionData;

    // Check Auth
    const token = localStorage.getItem('token');
    if (!token) {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return;
    }

    async function initialize() {
        try {
            // 1. Fetch Attraction Details
            const attractionRes = await fetch(`${API_URL}/attractions/${attractionId}`);
            if (!attractionRes.ok) throw new Error('Failed to load attraction');
            attractionData = await attractionRes.json();

            // Render Summary
            attractionSummaryEl.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${attractionData.image}" alt="${attractionData.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <h3 style="margin: 0;">${attractionData.name}</h3>
                        <p style="margin: 0.25rem 0; color: var(--text-secondary);">${attractionData.location}</p>
                    </div>
                </div>
            `;
            summaryDateEl.textContent = new Date(date).toLocaleDateString();
            summaryGuestsEl.textContent = guests;
            summaryPricePerPersonEl.textContent = `$${attractionData.price}`;

            const total = attractionData.price * guests;
            summaryTotalPriceEl.textContent = `$${total.toFixed(2)}`;
            payAmountBtnEl.textContent = `$${total.toFixed(2)}`;

            // 2. Initialize Stripe
            const configRes = await fetch(`${API_URL}/config`);
            const { publishableKey } = await configRes.json();
            stripe = Stripe(publishableKey);

            // 3. Create Payment Intent
            const intentRes = await fetch(`${API_URL}/attraction-bookings/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ attractionId, date, guests })
            });

            if (!intentRes.ok) throw new Error('Failed to create payment intent');
            const intentData = await intentRes.json();
            clientSecret = intentData.clientSecret;

            elements = stripe.elements({ clientSecret });
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');

        } catch (error) {
            console.error('Initialization error:', error);
            paymentMessage.textContent = error.message || 'Error loading booking details.';
            paymentMessage.style.color = 'red';
            submitButton.disabled = true;
        }
    }

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        paymentMessage.textContent = '';

        try {
            // Confirm Stripe Payment
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // We handle the redirect manually or use return_url
                    return_url: window.location.href, // This might trigger a reload, but we handle status below if possible
                },
                redirect: 'if_required'
            });

            if (error) {
                throw new Error(error.message);
            }

            // Create Booking in Backend
            const bookingRes = await fetch(`${API_URL}/attraction-bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    attractionId,
                    date,
                    guests,
                    paymentIntentId: (await stripe.retrievePaymentIntent(clientSecret)).paymentIntent.id
                })
            });

            if (!bookingRes.ok) throw new Error('Failed to save booking');
            const bookingData = await bookingRes.json();

            // Show Success
            paymentForm.style.display = 'none';
            document.querySelector('.booking-payment-card h2').style.display = 'none';
            document.querySelector('.booking-payment-card p.small-text').style.display = 'none';

            successState.style.display = 'block';
            bookingRefEl.textContent = bookingData.booking_reference;

        } catch (error) {
            console.error('Payment error:', error);
            paymentMessage.textContent = error.message;
            paymentMessage.style.color = 'red';
            submitButton.disabled = false;
            submitButton.textContent = `Pay $${(attractionData.price * guests).toFixed(2)}`;
        }
    });

    initialize();
});
