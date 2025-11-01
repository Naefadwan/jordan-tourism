const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentsController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/payments/create-payment-intent
// @desc    Create a Stripe Payment Intent
router.post('/create-payment-intent', authMiddleware, createPaymentIntent);

module.exports = router;