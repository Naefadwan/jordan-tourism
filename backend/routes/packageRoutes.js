const express = require('express');
const router = express.Router();
const packagesController = require('../controllers/packagesController');

router.get('/', packagesController.getAllPackages);
router.get('/:id', packagesController.getPackageById);

module.exports = router;
