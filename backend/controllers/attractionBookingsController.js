const AttractionBooking = require('../models/attractionBookingModel');
const User = require('../models/userModel');
const Attraction = require('../models/attractionModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

exports.createIntent = async (req, res) => {
    try {
        const { attractionId, date, guests } = req.body;

        if (!attractionId || !date || !guests) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const attraction = await Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }

        const totalPrice = attraction.price * guests;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalPrice * 100), // Stripe expects cents
            currency: 'usd',
            metadata: {
                type: 'attraction_booking',
                attractionId,
                guests,
                date
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            totalPrice
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { attractionId, date, guests, paymentIntentId } = req.body;
        const userId = req.user.id; // From authMiddleware (email)

        // Resolve user ID from email
        const user = await User.findByEmail(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const attraction = await Attraction.findById(attractionId);
        if (!attraction) return res.status(404).json({ message: 'Attraction not found' });

        // Verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not successful' });
        }

        const totalPrice = attraction.price * guests;
        const bookingReference = `ATR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const booking = await AttractionBooking.create({
            booking_reference: bookingReference,
            user_id: user.id,
            attraction_id: attractionId,
            booking_date: date,
            num_guests: guests,
            total_price: totalPrice,
            payment_intent_id: paymentIntentId
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error('Error creating attraction booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const user = await User.findByEmail(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const bookings = await AttractionBooking.findByUserId(user.id);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
