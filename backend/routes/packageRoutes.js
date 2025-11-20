const express = require('express');
const router = express.Router();
const packagesController = require('../controllers/packagesController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', packagesController.getAllPackages);
router.get('/:id', packagesController.getPackageById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), packagesController.createPackage);
router.delete('/:id', authMiddleware, adminMiddleware, packagesController.deletePackage);

module.exports = router;
