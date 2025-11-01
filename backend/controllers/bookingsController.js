const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const Room = require('../models/roomModel');
const { validate: isUuid } = require('uuid'); // Assuming you might use UUIDs for IDs
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

exports.getMyBookings = async (req, res) => {
    try {
        // req.user.id is the email from the JWT payload
        const user = await User.findByEmail(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const bookings = await Booking.findByUserId(user.id);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { accommodationId, roomId, checkin, checkout, guests, specialRequests, paymentIntentId } = req.body; // specialRequests can be undefined

        // 1. Comprehensive Input Validation
        if (!checkin || !checkout || !Date.parse(checkin) || !Date.parse(checkout)) {
            return res.status(400).json({ message: 'Valid check-in and check-out dates are required.' });
        }
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        if (checkinDate >= checkoutDate) {
            return res.status(400).json({ message: 'Checkout date must be after check-in date.' });
        }
        if (checkinDate < new Date()) {
            return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
        }
        if (!Number.isInteger(guests) || guests <= 0) {
            return res.status(400).json({ message: 'Number of guests must be a positive integer.' });
        }
        if (specialRequests && specialRequests.length > 500) {
            return res.status(400).json({ message: 'Special requests cannot exceed 500 characters.' });
        }
        if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
            return res.status(400).json({ message: 'A valid Payment Intent ID is required.' });
        }

        // 2. Get User
        const user = await User.findByEmail(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 3. Validate Room and Get Price (Server-side)
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // 4. Data Consistency Checks
        if (room.accommodation_id !== accommodationId) {
            return res.status(400).json({ message: 'Room does not belong to the specified accommodation.' });
        }
        if (guests > room.max_capacity) {
            return res.status(400).json({ message: 'Guest count exceeds room capacity.' });
        }

        // 5. Check for overlapping bookings (Availability Check)
        const overlappingBookings = await Booking.findOverlappingBookings(roomId, checkin, checkout);
        if (overlappingBookings.length > 0) {
            return res.status(409).json({ message: 'This room is not available for the selected dates.' });
        }

        // 6. Idempotency Check: Ensure Payment Intent hasn't been used
        const existingBooking = await Booking.findByPaymentIntentId(paymentIntentId);
        if (existingBooking) {
            return res.status(400).json({ message: 'This payment has already been used for a booking.' });
        }

        // 7. Verify Payment Intent with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // 8. Calculate Price (Server-side) and Verify Amount
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        const basePrice = room.price_per_night * nights;
        const feesAndTaxes = basePrice * 0.14; // 14% fee
        const totalPrice = basePrice + feesAndTaxes;

        if (paymentIntent.amount !== Math.round(totalPrice * 100) || paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment verification failed. Please try again.' });
        }

        // 9. Generate Unique Booking Reference
        const bookingReference = `DJ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // 10. Create Booking in DB
        const newBooking = await Booking.create({
            booking_reference: bookingReference,
            user_id: user.id,
            accommodation_id: accommodationId,
            room_id: roomId,
            check_in_date: checkin,
            check_out_date: checkout,
            num_guests: guests, // This was 'guests'
            base_price: basePrice,
            fees_and_taxes: feesAndTaxes,
            total_price: totalPrice,
            special_requests: specialRequests ? specialRequests.trim() : null,
            payment_intent_id: paymentIntentId
        });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        // Secure error response
        const response = { message: 'Server error' };
        if (process.env.NODE_ENV === 'development') {
            response.error = error.message;
        }
        res.status(500).json(response);
    }
};