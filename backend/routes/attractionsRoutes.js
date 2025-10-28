const express = require('express');
const router = express.Router();
const { getAllAttractions, getAttractionById } = require('../controllers/attractionsController');

// @route   GET /api/attractions
router.get('/', getAllAttractions);

// @route   GET /api/attractions/:id
router.get('/:id', getAttractionById);

module.exports = router;