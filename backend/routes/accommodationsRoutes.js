const express = require('express');
const router = express.Router();
const accommodationsController = require('../controllers/accommodationsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const companyMiddleware = require('../middleware/companyMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', accommodationsController.getAllAccommodations);
router.get('/:id', accommodationsController.getAccommodationById);

// Admin/Company routes
router.post('/', authMiddleware, companyMiddleware, upload.single('image'), accommodationsController.createAccommodation);
router.put('/:id', authMiddleware, companyMiddleware, upload.single('image'), accommodationsController.updateAccommodation);
router.delete('/:id', authMiddleware, companyMiddleware, accommodationsController.deleteAccommodation);

module.exports = router;