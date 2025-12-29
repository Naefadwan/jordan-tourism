const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');
const authMiddleware = require('../middleware/authMiddleware');
const companyMiddleware = require('../middleware/companyMiddleware');

// All room management routes require authentication and company/admin privileges
router.get('/accommodation/:accommodationId', roomsController.getRoomsByAccommodation);
router.post('/', authMiddleware, companyMiddleware, roomsController.createRoom);
router.put('/:id', authMiddleware, companyMiddleware, roomsController.updateRoom);
router.delete('/:id', authMiddleware, companyMiddleware, roomsController.deleteRoom);

module.exports = router;
