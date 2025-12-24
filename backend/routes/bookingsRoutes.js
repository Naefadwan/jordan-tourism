const express = require('express');
const router = express.Router();
const { getMyBookings, createBooking, getAllBookingsForAdmin } = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/authMiddleware');
const companyMiddleware = require('../middleware/companyMiddleware');

// @route   GET /api/bookings/my-bookings
// @desc    Get bookings for the logged-in user
router.get('/my-bookings', authMiddleware, getMyBookings);

// @route   GET /api/bookings/admin/all
// @desc    Get all bookings for admin/company dashboard
router.get('/admin/all', authMiddleware, companyMiddleware, getAllBookingsForAdmin);

// @route   POST /api/bookings
// @desc    Create a new booking
router.post('/', authMiddleware, createBooking);

module.exports = router;