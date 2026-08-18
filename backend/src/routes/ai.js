/**
 * ai.js – AI Assistant Router
 *
 * POST /api/ai/hint    – Get progressive algorithm hint
 * POST /api/ai/explain – Get intuition, approach & time complexity
 * POST /api/ai/review  – Debug code & explain bugs
 * POST /api/ai/chat    – Interactive AI coding mentor chat
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/hint', optionalAuth, aiController.getHint);
router.post('/explain', optionalAuth, aiController.getApproach);
router.post('/review', optionalAuth, aiController.reviewCode);
router.post('/chat', optionalAuth, aiController.chat);

module.exports = router;
