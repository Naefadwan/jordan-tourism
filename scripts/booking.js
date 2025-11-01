document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';
    let stripe, elements, paymentIntentId;
    const bookingState = {
        currentStep: 1,
        accommodationId: '',
        checkin: '',
        checkout: '',
        accommodationName: '',
        guests: 0,
        roomType: '',
        roomId: null,
        roomPrice: 0,
        nights: 0,
        basePrice: 0,
        fees: 0,
        totalPrice: 0,
        paymentIntentId: null,
        clientSecret: null,
    };

    const steps = document.querySelectorAll('.booking-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const confirmBtn = document.getElementById('confirm-btn');

    function updateStepUI() {
        steps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === bookingState.currentStep);
        });

        progressSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum <= bookingState.currentStep);
            step.classList.toggle('completed', stepNum < bookingState.currentStep);
        });

        backBtn.style.display = bookingState.currentStep > 1 && bookingState.currentStep < 4 ? 'inline-flex' : 'none';
        nextBtn.style.display = bookingState.currentStep < 3 ? 'inline-flex' : 'none';
        confirmBtn.style.display = bookingState.currentStep === 3 ? 'inline-flex' : 'none';
        
        if (bookingState.currentStep === 1) {
            nextBtn.style.display = 'none'; // Hide on step 1 until a room is selected
        }
    }

    function calculatePrice() {
        const checkinDate = new Date(bookingState.checkin);
        const checkoutDate = new Date(bookingState.checkout);
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        bookingState.nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (bookingState.nights <= 0) bookingState.nights = 1;

        bookingState.basePrice = bookingState.roomPrice * bookingState.nights;
        bookingState.fees = bookingState.basePrice * 0.14; // 14% fee/tax
        bookingState.totalPrice = bookingState.basePrice + bookingState.fees;
    }

    function updateSummary() {
        calculatePrice();
        document.getElementById('summary-hotel-name').textContent = bookingState.accommodationName;
        document.getElementById('summary-dates').textContent = `${bookingState.checkin} to ${bookingState.checkout} (${bookingState.nights} nights)`;
        document.getElementById('summary-guests').textContent = `${bookingState.guests} guests`;
        document.getElementById('summary-room-type').textContent = bookingState.roomType;
        document.getElementById('summary-price-calc').textContent = `$${bookingState.roomPrice} x ${bookingState.nights} nights`;
        document.getElementById('summary-base-price').textContent = `$${bookingState.basePrice.toFixed(2)}`;
        document.getElementById('summary-fees').textContent = `$${bookingState.fees.toFixed(2)}`;
        document.getElementById('summary-total-price').textContent = `$${bookingState.totalPrice.toFixed(2)}`;
    }

    function validateForm(step) {
        let isValid = true;
        const form = document.querySelector(`.booking-step[data-step="${step}"] form`);
        if (!form) return true;

        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));
        form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('invalid'));

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            const errorSpan = input.nextElementSibling;
            let message = '';

            if (input.value.trim() === '') {
                message = 'This field is required.';
            }

            if (message) {
                isValid = false;
                if (errorSpan) {
                    errorSpan.textContent = message;
                    errorSpan.classList.add('visible');
                }
                input.classList.add('invalid');
            }
        });

        return isValid;
    }

    // Initialize from URL
    const savedBookingState = JSON.parse(localStorage.getItem('bookingState'));
    if (savedBookingState) {
        // Restore state if returning from payment redirect
        Object.assign(bookingState, savedBookingState);
        localStorage.removeItem('bookingState'); // Clean up immediately
    } else {
        // Initialize from URL for a new booking
        const params = new URLSearchParams(window.location.search);
        bookingState.accommodationId = params.get('accommodationId');
        bookingState.accommodationName = params.get('accommodationName');
        bookingState.checkin = params.get('checkin') || new Date().toISOString().split('T')[0];
        bookingState.checkout = params.get('checkout') || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
        bookingState.guests = params.get('guests') || 2;
    }
    
    document.getElementById('date-range-display').textContent = `${bookingState.checkin} to ${bookingState.checkout}`;
    document.getElementById('guest-count-display').textContent = `${bookingState.guests} guests`;

    async function initializeStripe() {
        // Validate that roomId is set before initializing Stripe
        if (!bookingState.roomId || bookingState.roomId === null) {
            const messageEl = document.getElementById('payment-message');
            if (messageEl) {
                messageEl.textContent = "Please select a room first.";
                messageEl.style.color = '#dc3545';
            }
            console.error("Cannot initialize Stripe: roomId is not set");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            // Fetch the publishable key from the server
            const configResponse = await fetch(`${API_URL}/config`);
            if (!configResponse.ok) {
                const errorData = await configResponse.json();
                throw new Error(errorData.message || 'Failed to fetch Stripe configuration');
            }
            
            const { publishableKey } = await configResponse.json();
            
            if (!publishableKey || typeof publishableKey !== 'string' || publishableKey.trim() === '') {
                throw new Error('Stripe publishable key is missing or invalid');
            }
            
            stripe = Stripe(publishableKey);

            const intentResponse = await fetch(`${API_URL}/payments/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({
                    roomId: bookingState.roomId,
                    checkin: bookingState.checkin,
                    checkout: bookingState.checkout,
                })
            });
            
            if (!intentResponse.ok) {
                const errorData = await intentResponse.json().catch(() => ({ message: 'Failed to create payment intent' }));
                throw new Error(errorData.message || 'Failed to create payment intent');
            }
            
            const { clientSecret } = await intentResponse.json();
            bookingState.clientSecret = clientSecret; // Store the client secret
            if (!clientSecret) {
                throw new Error('Payment intent was created but no client secret was returned');
            }
            
            elements = stripe.elements({ clientSecret });
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');
        } catch (error) {
            console.error("Failed to initialize Stripe:", error);
            const messageEl = document.getElementById('payment-message');
            if (messageEl) {
                messageEl.textContent = error.message || "Could not load payment form. Please refresh the page.";
                messageEl.style.color = '#dc3545';
            }
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('invalid'));
    }

    // Step Navigation
    nextBtn.addEventListener('click', async () => {
        if (validateForm(bookingState.currentStep)) {
            clearAllErrors();
            
            // Validate room selection before moving to step 2
            if (bookingState.currentStep === 1 && !bookingState.roomId) {
                alert('Please select a room before continuing.');
                return;
            }
            
            bookingState.currentStep++;
            if (bookingState.currentStep === 3) {
                updateSummary();
                await initializeStripe(); // Initialize Stripe on payment step
            }
            updateStepUI();
        }
    });

    backBtn.addEventListener('click', () => {
        if (bookingState.currentStep > 1) {
            clearAllErrors();
            bookingState.currentStep--;
            updateStepUI();
        }
    });

    confirmBtn.addEventListener('click', async () => {
        // Save state before potential redirect
        localStorage.setItem('bookingState', JSON.stringify(bookingState));

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/booking.html`,
            },
            redirect: 'if_required' // Prevent immediate redirect
        });

        if (stripeError) {
            document.getElementById('payment-message').textContent = stripeError.message;
            localStorage.removeItem('bookingState'); // Clean up on error
            return;
        }

        // Payment succeeded, now create the booking on our server
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    accommodationId: bookingState.accommodationId,
                    roomId: bookingState.roomId,
                    checkin: bookingState.checkin,
                    checkout: bookingState.checkout,
                    guests: bookingState.guests,
                    specialRequests: document.getElementById('requests').value,
                    paymentIntentId: bookingState.clientSecret.split('_secret')[0]
                }),
            });

            if (!response.ok) throw await response.json();

            const newBooking = await response.json();
            bookingState.currentStep = 4;
            document.getElementById('booking-ref').textContent = newBooking.booking_reference;
            document.getElementById('final-price').textContent = `$${parseFloat(newBooking.total_price).toFixed(2)}`;
            updateStepUI();
            localStorage.removeItem('bookingState'); // Final cleanup on success

        } catch (serverError) {
            console.error('Booking creation failed:', serverError);
            localStorage.removeItem('bookingState'); // Clean up on error
            alert(`Booking Failed: ${serverError.message}`);
        }
    });

    // Reusable function to set up room selection handlers
    function setupRoomSelectionHandlers() {
        document.querySelectorAll('.select-room-btn').forEach(button => {
            // Remove any existing listeners by cloning
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', () => {
                const roomId = parseInt(newButton.dataset.roomId);
                if (!roomId || isNaN(roomId)) {
                    console.error('Room ID is missing or invalid:', newButton.dataset.roomId);
                    alert('Room selection error: Invalid room ID. Please try again.');
                    return;
                }
                
                bookingState.roomType = newButton.dataset.roomType;
                bookingState.roomPrice = parseFloat(newButton.dataset.price);
                bookingState.roomId = roomId;
                
                // Visually indicate selection
                document.querySelectorAll('.room-type-card').forEach(c => c.classList.remove('selected'));
                newButton.closest('.room-type-card').classList.add('selected');

                nextBtn.style.display = 'inline-flex';
            });
        });
    }

    // Load rooms dynamically if accommodationId is available
    async function loadRooms() {
        if (!bookingState.accommodationId) {
            console.warn('No accommodation ID provided, using hardcoded rooms');
            setupRoomSelectionHandlers(); // Set up handlers for hardcoded rooms
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/accommodations/${bookingState.accommodationId}`);
            if (!response.ok) {
                throw new Error('Failed to load accommodation details');
            }
            
            const accommodation = await response.json();
            // Set the accommodation name in the state for the summary
            bookingState.accommodationName = accommodation.name;

            const roomsContainer = document.querySelector('.room-selection-grid');
            
            if (!roomsContainer) {
                console.error('Room selection grid not found');
                setupRoomSelectionHandlers(); // Fallback to hardcoded rooms
                return;
            }
            
            // Clear existing rooms
            roomsContainer.innerHTML = '';
            
            if (accommodation.rooms && accommodation.rooms.length > 0) {
                accommodation.rooms.forEach(room => {
                    const roomCard = document.createElement('div');
                    roomCard.className = 'room-type-card';
                    roomCard.innerHTML = `
                        <h3>${room.roomType}</h3>
                        <p>${room.description || 'No description available.'}</p>
                        <div class="room-price">$${room.pricePerNight}/night</div>
                        <button class="btn-primary select-room-btn" data-room-id="${room.id}" data-room-type="${room.roomType}" data-price="${room.pricePerNight}">Select</button>
                    `;
                    roomsContainer.appendChild(roomCard);
                });
                
                // Set up event handlers for dynamically loaded rooms
                setupRoomSelectionHandlers();
            } else {
                roomsContainer.innerHTML = '<p>No rooms available for this accommodation.</p>';
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            const roomsContainer = document.querySelector('.room-selection-grid');
            if (roomsContainer && roomsContainer.children.length === 0) {
                roomsContainer.innerHTML = '<p>Error loading rooms. Please refresh the page.</p>';
            }
            // Fallback to hardcoded rooms if they exist
            setupRoomSelectionHandlers();
        }
    }
    
    // Load rooms on page load
    loadRooms();
    
    updateStepUI();
});