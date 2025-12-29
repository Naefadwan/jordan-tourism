const express = require('express');
const router = express.Router();
const { getAllAttractions, getAttractionById, createAttraction, updateAttraction, deleteAttraction } = require('../controllers/attractionsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', optionalAuth, getAllAttractions);
router.get('/:id', optionalAuth, getAttractionById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createAttraction);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateAttraction);
router.delete('/:id', authMiddleware, adminMiddleware, deleteAttraction);

module.exports = router;