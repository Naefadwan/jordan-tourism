const express = require('express');
const router = express.Router();
const { getMyBookings, createBooking } = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/bookings/my-bookings
// @desc    Get bookings for the logged-in user
router.get('/my-bookings', authMiddleware, getMyBookings);

// @route   POST /api/bookings
// @desc    Create a new booking
router.post('/', authMiddleware, createBooking);

module.exports = router;