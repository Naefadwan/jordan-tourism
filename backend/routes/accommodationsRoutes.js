const express = require('express');
const router = express.Router();
const accommodationsController = require('../controllers/accommodationsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', accommodationsController.getAllAccommodations);
router.get('/:id', accommodationsController.getAccommodationById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), accommodationsController.createAccommodation);
router.delete('/:id', authMiddleware, adminMiddleware, accommodationsController.deleteAccommodation);

module.exports = router;