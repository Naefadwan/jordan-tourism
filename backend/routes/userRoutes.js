const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUser, getUserById } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users (Admin only)
router.get('/', authMiddleware, getAllUsers);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
router.delete('/:id', authMiddleware, deleteUser);

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
router.put('/:id', authMiddleware, updateUser);

// @route   GET /api/users/:id
// @desc    Get single user (Admin only)
router.get('/:id', authMiddleware, getUserById);

module.exports = router;
