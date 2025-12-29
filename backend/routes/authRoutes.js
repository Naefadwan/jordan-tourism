const express = require('express');
const router = express.Router();
const { register, login, getProfile, sendOTP } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/send-otp
router.post('/send-otp', sendOTP);

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   GET /api/auth/profile
router.get('/profile', authMiddleware, getProfile);

module.exports = router;