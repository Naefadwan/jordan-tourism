const express = require('express');
const router = express.Router();
const { getLikes, addLike, removeLike } = require('../controllers/likesController');
const authMiddleware = require('../middleware/authMiddleware');

// All like routes are protected
router.use(authMiddleware);

// @route   GET /api/likes
router.get('/', getLikes);

// @route   POST /api/likes/:attractionId
router.post('/:attractionId', addLike);

// @route   DELETE /api/likes/:attractionId
router.delete('/:attractionId', removeLike);

module.exports = router;