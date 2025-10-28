document.addEventListener('DOMContentLoaded', () => {
    const bookingState = {
        currentStep: 1,
        checkin: '',
        checkout: '',
        guests: 0,
        roomType: '',
        roomPrice: 0,
        nights: 0,
        basePrice: 0,
        fees: 0,
        totalPrice: 0,
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
            } else if (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value)) {
                message = 'Please enter a valid email address.';
            } else if (input.id === 'cardNumber' && !/^\d{13,16}$/.test(input.value.replace(/\s/g, ''))) {
                message = 'Please enter a valid card number.';
            } else if (input.id === 'expiryDate' && !/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(input.value)) {
                message = 'Please use MM / YY format.';
            } else if (input.id === 'cvc' && !/^\d{3,4}$/.test(input.value)) {
                message = 'Please enter a valid CVC.';
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

    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('invalid'));
    }

    // Initialize from URL
    const params = new URLSearchParams(window.location.search);
    bookingState.checkin = params.get('checkin') || new Date().toISOString().split('T')[0];
    bookingState.checkout = params.get('checkout') || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
    bookingState.guests = params.get('guests') || 2;

    document.getElementById('date-range-display').textContent = `${bookingState.checkin} to ${bookingState.checkout}`;
    document.getElementById('guest-count-display').textContent = `${bookingState.guests} guests`;

    // Step Navigation
    nextBtn.addEventListener('click', () => {
        if (validateForm(bookingState.currentStep)) {
            clearAllErrors();
            bookingState.currentStep++;
            if (bookingState.currentStep === 3) {
                updateSummary();
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

    confirmBtn.addEventListener('click', () => {
        if (!validateForm(3)) return;
        bookingState.currentStep = 4;
        document.getElementById('booking-ref').textContent = `DJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        document.getElementById('final-price').textContent = `$${bookingState.totalPrice.toFixed(2)}`;
        updateStepUI();
    });

    // Room Selection
    document.querySelectorAll('.select-room-btn').forEach(button => {
        button.addEventListener('click', () => {
            bookingState.roomType = button.dataset.roomType;
            bookingState.roomPrice = parseFloat(button.dataset.price);
            
            // Visually indicate selection
            document.querySelectorAll('.room-type-card').forEach(c => c.classList.remove('selected'));
            button.closest('.room-type-card').classList.add('selected');

            nextBtn.style.display = 'inline-flex';
        });
    });

    updateStepUI();
});