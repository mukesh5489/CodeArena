/**
 * auth.js – Authentication Routes
 *
 * POST /api/auth/register  – Register as a student
 * POST /api/auth/login     – Sign in with email + password
 * GET  /api/auth/me        – Current user profile (JWT required)
 * POST /api/auth/logout    – Sign out
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
