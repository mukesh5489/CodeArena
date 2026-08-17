/**
 * contests.js – Contest Routes
 *
 * GET    /api/contests             – List all contests (public)
 * GET    /api/contests/:id         – Single contest details (public)
 * GET    /api/contests/:id/problems – Problems in contest (public)
 * GET    /api/contests/:id/leaderboard – Contest leaderboard (public)
 * POST   /api/contests/:id/register – Register user for contest
 * POST   /api/contests             – Create new contest (Admin only)
 * DELETE /api/contests/:id         – Delete contest (Admin only)
 */

const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', contestController.listContests);
router.get('/:id', contestController.getContest);
router.get('/:id/problems', contestController.getContestProblems);
router.get('/:id/leaderboard', contestController.getContestLeaderboard);
router.get('/:id/export', contestController.exportContestResults);
router.post('/:id/register', optionalAuth, contestController.registerForContest);

router.post('/', requireAuth, requireAdmin, contestController.createContest);
router.patch('/:id', requireAuth, requireAdmin, contestController.updateContest);
router.delete('/:id', requireAuth, requireAdmin, contestController.deleteContest);

module.exports = router;

