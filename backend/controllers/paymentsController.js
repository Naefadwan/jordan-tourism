const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Room = require('../models/roomModel');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { roomId, checkin, checkout } = req.body;

        // Validate required fields
        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }
        
        if (!checkin || !checkout) {
            return res.status(400).json({ message: 'Check-in and check-out dates are required' });
        }

        // 1. Validate Room and Get Price (Server-side)
        const room = await Room.findById(roomId);
        if (!room) {
            console.error(`Room not found with ID: ${roomId}`);
            return res.status(404).json({ message: 'Room not found' });
        }

        // 2. Calculate Price (Server-side)
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        if (nights <= 0) {
            return res.status(400).json({ message: 'Invalid date range.' });
        }

        const basePrice = room.price_per_night * nights;
        const feesAndTaxes = basePrice * 0.14; // 14% fee
        const totalPrice = basePrice + feesAndTaxes;

        // 3. Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalPrice * 100), // Amount in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};