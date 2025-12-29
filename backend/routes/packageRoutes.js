const express = require('express');
const router = express.Router();
const packagesController = require('../controllers/packagesController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const companyMiddleware = require('../middleware/companyMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', optionalAuth, packagesController.getAllPackages);
router.get('/:id', optionalAuth, packagesController.getPackageById);

// Admin/Company routes
router.post('/', authMiddleware, companyMiddleware, upload.single('image'), packagesController.createPackage);
router.put('/:id', authMiddleware, companyMiddleware, upload.single('image'), packagesController.updatePackage);
router.delete('/:id', authMiddleware, companyMiddleware, packagesController.deletePackage);

module.exports = router;
