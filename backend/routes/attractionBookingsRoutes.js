const express = require('express');
const router = express.Router();
const { createBooking, createIntent, getMyBookings } = require('../controllers/attractionBookingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-intent', authMiddleware, createIntent);
router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getMyBookings);

module.exports = router;
