/**
 * notifications.js – Notifications Router
 *
 * GET   /api/notifications          – Fetch notifications for authenticated user
 * PATCH /api/notifications/read-all  – Mark all notifications as read
 * PATCH /api/notifications/:id/read – Mark notification as read
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, notificationController.listNotifications);
router.patch('/read-all', requireAuth, notificationController.markAllAsRead);
router.patch('/:id/read', requireAuth, notificationController.markAsRead);

module.exports = router;
