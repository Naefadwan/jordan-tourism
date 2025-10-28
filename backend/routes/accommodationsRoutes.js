const express = require('express');
const router = express.Router();
const { getAllAccommodations, getAccommodationById } = require('../controllers/accommodationsController');

// @route   GET /api/accommodations
router.get('/', getAllAccommodations);

// @route   GET /api/accommodations/:id
router.get('/:id', getAccommodationById);

module.exports = router;