const express = require('express');
const router = express.Router();
const packagesController = require('../controllers/packagesController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const companyMiddleware = require('../middleware/companyMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', packagesController.getAllPackages);
router.get('/:id', packagesController.getPackageById);

// Admin/Company routes
router.post('/', authMiddleware, companyMiddleware, upload.single('image'), packagesController.createPackage);
router.put('/:id', authMiddleware, companyMiddleware, upload.single('image'), packagesController.updatePackage);
router.delete('/:id', authMiddleware, companyMiddleware, packagesController.deletePackage);

module.exports = router;
