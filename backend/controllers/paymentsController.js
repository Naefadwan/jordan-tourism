const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Room = require('../models/roomModel');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { roomId, checkin, checkout } = req.body;

        // Validate required fields
        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }
        
        if (!checkin || !checkout || !Date.parse(checkin) || !Date.parse(checkout)) {
            return res.status(400).json({ message: 'Valid check-in and check-out dates in ISO 8601 format are required' });
        }

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare against the start of today

        if (checkinDate < today) return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
        if (checkinDate >= checkoutDate) return res.status(400).json({ message: 'Checkout date must be after check-in date.' });


        // 1. Validate Room and Get Price (Server-side)
        const room = await Room.findById(roomId);
        if (!room) {
            console.error(`Room not found with ID: ${roomId}`);
            return res.status(404).json({ message: 'Room not found' });
        }

        // 2. Calculate Price (Server-side)
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        if (!Number.isInteger(nights) || nights <= 0) {
            return res.status(400).json({ message: 'Invalid date range.' });
        }
        if (nights > 365) { // Maximum stay length
            return res.status(400).json({ message: 'Bookings cannot exceed 365 nights.' });
        }

        const pricePerNight = parseFloat(room.price_per_night);
        if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
            return res.status(400).json({ message: 'Invalid room price.' });
        }

        const basePrice = pricePerNight * nights;
        const feesAndTaxes = basePrice * 0.14; // 14% fee
        const totalPrice = basePrice + feesAndTaxes;

        // 3. Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalPrice * 100), // Amount in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                roomId: String(roomId),
                checkin: checkin, // ISO string
                checkout: checkout, // ISO string
            }
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};