const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const Room = require('../models/roomModel');
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
        const { accommodationId, roomId, checkin, checkout, guests, specialRequests, paymentIntentId } = req.body;

        // 1. Get User
        const user = await User.findByEmail(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Validate Room and Get Price (Server-side)
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // 2a. Verify Payment Intent
        if (!paymentIntentId) return res.status(400).json({ message: 'Payment Intent ID is required.' });
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // 3. Calculate Price (Server-side)
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        if (nights <= 0) return res.status(400).json({ message: 'Checkout date must be after check-in date.' });

        const basePrice = room.price_per_night * nights;
        const feesAndTaxes = basePrice * 0.14; // 14% fee
        const totalPrice = basePrice + feesAndTaxes;

        // 3a. Verify payment amount and status
        if (paymentIntent.amount !== Math.round(totalPrice * 100) || paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment verification failed. Please try again.' });
        }

        // 4. Generate Unique Booking Reference
        const bookingReference = `DJ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // 5. Create Booking in DB
        const newBooking = await Booking.create({
            booking_reference: bookingReference,
            user_id: user.id,
            accommodation_id: accommodationId,
            room_id: roomId,
            check_in_date: checkin,
            check_out_date: checkout,
            num_guests: guests,
            base_price: basePrice,
            fees_and_taxes: feesAndTaxes,
            total_price: totalPrice,
            special_requests: specialRequests
        });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};