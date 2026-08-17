/**
 * submissions.js – Code Execution & Submissions Router
 *
 * POST /api/submissions/run  – Run code against sample test cases
 * POST /api/submissions      – Submit code for full testcase evaluation
 * GET  /api/submissions/my   – View MY submissions (authenticated user only)
 * GET  /api/submissions      – View all submissions (admin overview)
 */

const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

router.post('/run', optionalAuth, submissionController.runSampleCode);
router.post('/', requireAuth, submissionController.createSubmission);
router.get('/my', requireAuth, submissionController.getMySubmissions);
router.get('/', optionalAuth, submissionController.listSubmissions);

module.exports = router;
