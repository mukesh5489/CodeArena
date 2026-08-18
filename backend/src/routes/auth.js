/**
 * auth.js – Authentication Routes
 *
 * POST /api/auth/send-otp   – Send 4-digit OTP to email for new registration
 * POST /api/auth/verify-otp – Verify OTP and create account
 * POST /api/auth/register   – Register as a student (legacy, no OTP)
 * POST /api/auth/login      – Sign in with email + password
 * GET  /api/auth/me         – Current user profile (JWT required)
 * POST /api/auth/logout     – Sign out
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
