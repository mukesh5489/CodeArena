/**
 * admin.js – Admin-only Routes (ALL require ADMIN role)
 *
 * GET    /api/admin/users           – List all registered users
 * DELETE /api/admin/users/:id       – Remove a user
 * POST   /api/admin/broadcast       – Email broadcast to all users
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication + ADMIN role
router.use(requireAuth, requireAdmin);

router.get('/users', adminController.listUsers);
router.delete('/users/:id', adminController.deleteUser);
router.post('/broadcast', adminController.broadcastEmail);

module.exports = router;
