/**
 * notificationController.js – User Notifications Controller
 */

const { supabase, isConfigured } = require('../database/supabase');

/**
 * GET /api/notifications
 */
async function listNotifications(req, res) {
  const userId = req.user?.id || '22222222-2222-2222-2222-222222222222';

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data: data || [] });
  }

  return res.json({
    success: true,
    data: [],
  });
}

/**
 * PATCH /api/notifications/:id/read
 */
async function markAsRead(req, res) {
  const { id } = req.params;

  if (isConfigured && supabase) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }

  return res.json({ success: true, message: 'Notification marked as read' });
}

/**
 * PATCH /api/notifications/read-all
 */
async function markAllAsRead(req, res) {
  const userId = req.user?.id;

  if (isConfigured && supabase && userId) {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  }

  return res.json({ success: true, message: 'All notifications marked as read' });
}

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
