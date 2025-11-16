const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const Package = require('../models/packageModel');
const PackageBooking = require('../models/packageBookingModel');
const User = require('../models/userModel');

function generateBookingReference() {
    return `PKG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// POST /api/package-payments/create-intent
exports.createPackagePaymentIntent = async (req, res) => {
    try {
        const { packageId, startDate, guests } = req.body;

        if (!packageId || !startDate || !guests) {
            return res.status(400).json({ message: 'Package, start date, and guests are required' });
        }

        const pkg = await Package.findById(packageId);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const basePrice = parseFloat(pkg.from_price);
        const totalPrice = basePrice * Number(guests || 1);
        const amountInCents = Math.round(totalPrice * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                type: 'package',
                packageId,
                guests,
                startDate
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            totalPrice
        });
    } catch (error) {
        console.error('Error creating package payment intent:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/package-bookings
exports.createPackageBooking = async (req, res) => {
    try {
        const { packageId, startDate, guests, paymentIntentId } = req.body;

        if (!packageId || !startDate || !guests || !paymentIntentId) {
            return res.status(400).json({ message: 'Missing required booking fields' });
        }

        const pkg = await Package.findById(packageId);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // JWT currently stores email as id => use findByEmail
        const user = await User.findByEmail(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + pkg.nights);

        const totalPrice = parseFloat(pkg.from_price) * Number(guests || 1);
        const booking_reference = generateBookingReference();

        const newBooking = await PackageBooking.create({
            booking_reference,
            user_id: user.id,
            package_id: pkg.id,
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0],
            guests: Number(guests),
            total_price: totalPrice,
            payment_intent_id: paymentIntentId
        });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Error creating package booking:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
