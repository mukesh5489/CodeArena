/**
 * users.js – User Routes
 * GET /api/users/leaderboard – Ranked list of all registered users
 */

const express = require('express');
const router = express.Router();
const { getLeaderboard, getPlatformStats } = require('../controllers/usersController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/leaderboard', optionalAuth, getLeaderboard);
router.get('/stats', getPlatformStats);

module.exports = router;

