const express = require('express');
const router = express.Router();
const attractionsController = require('../controllers/attractionsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', attractionsController.getAllAttractions);
router.get('/:id', attractionsController.getAttractionById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), attractionsController.createAttraction);
router.delete('/:id', authMiddleware, adminMiddleware, attractionsController.deleteAttraction);

module.exports = router;