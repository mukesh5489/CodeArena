/**
 * problems.js – Problem Routes
 *
 * GET    /api/problems      – List all problems (public)
 * GET    /api/problems/:id  – Get single problem details (public)
 * POST   /api/problems      – Create new problem (Admin only)
 * PATCH  /api/problems/:id  – Update a problem (Admin only)
 * DELETE /api/problems/:id  – Delete problem (Admin only)
 */

const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', problemController.listProblems);
router.get('/:id', problemController.getProblem);
router.post('/', requireAuth, requireAdmin, problemController.createProblem);
router.patch('/:id', requireAuth, requireAdmin, problemController.updateProblem);
router.delete('/:id', requireAuth, requireAdmin, problemController.deleteProblem);

module.exports = router;
