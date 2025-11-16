const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const packageBookingsController = require('../controllers/packageBookingsController');

router.use(authMiddleware);

router.post('/payments/create-intent', packageBookingsController.createPackagePaymentIntent);
router.post('/', packageBookingsController.createPackageBooking);

module.exports = router;