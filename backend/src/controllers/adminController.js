/**
 * adminController.js – Full Admin Control Panel
 *
 * GET    /api/admin/users              – List all registered users
 * DELETE /api/admin/users/:id          – Delete a user account
 * PATCH  /api/admin/users/:id/role     – Update user role
 * POST   /api/admin/broadcast          – Send email notification to all users
 */

const { supabase, isConfigured } = require('../database/supabase');
const { sendMail } = require('../services/emailService');

/**
 * GET /api/admin/users
 * Returns all registered users (without password_hash)
 */
async function listUsers(req, res) {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, avatar_url, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }
    return res.json({ success: true, data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/admin/users/:id
 * Permanently removes a user and their submissions from the platform
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Protect the admin account from deletion
    if (req.user.email === 'admin2026@gmail.com' && id === req.user.id) {
      return res.status(403).json({ success: false, error: 'Cannot delete admin account.' });
    }

    if (isConfigured && supabase) {
      // Delete user's submissions first (foreign key)
      await supabase.from('submissions').delete().eq('user_id', id);
      await supabase.from('notifications').delete().eq('user_id', id);
      await supabase.from('contest_participants').delete().eq('user_id', id);

      // Delete user
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    }

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/admin/broadcast
 * Sends a notification email via Gmail SMTP to ALL registered users
 * Body: { subject, message, type? }
 */
async function broadcastEmail(req, res) {
  try {
    const { subject, message, type = 'announcement' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Subject and message are required.' });
    }

    let users = [];
    if (isConfigured && supabase) {
      const { data } = await supabase
        .from('users')
        .select('id, name, email')
        .neq('email', 'admin2026@gmail.com'); // Don't email the admin themselves
      users = data || [];
    }

    if (users.length === 0) {
      return res.json({ success: true, message: 'No registered student users to notify.', sent: 0 });
    }

    // Build HTML email template
    const buildHtml = (userName) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0f1e; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid #1e2d4a;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #3b82f6; font-size: 28px; margin: 0; font-weight: 800;">CodeArena</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Competitive Programming Platform</p>
        </div>
        <div style="background-color: #111827; border-radius: 12px; padding: 24px; border: 1px solid #1e2d4a; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Hi ${userName}! 👋</h2>
          <div style="color: #cbd5e1; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
        </div>
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
          CodeArena Platform — Sent from saimukesh363@gmail.com
        </p>
      </div>
    `;

    // Also record in-app notifications for all users
    if (isConfigured && supabase) {
      const notifications = users.map((u) => ({
        user_id: u.id,
        title: subject,
        message: message,
        type: type,
        is_read: false,
      }));
      await supabase.from('notifications').insert(notifications);
    }

    // Send emails via Gmail SMTP in parallel
    const emailPromises = users.map((u) =>
      sendMail({
        to: u.email,
        subject,
        html: buildHtml(u.name),
        text: message,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const sentCount = results.filter((r) => r.status === 'fulfilled' && r.value?.success).length;
    const failedCount = users.length - sentCount;

    return res.json({
      success: true,
      message: `Notification email dispatched to ${sentCount} user(s).`,
      sent: sentCount,
      failed: failedCount,
      total: users.length,
    });
  } catch (err) {
    console.error('Broadcast Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { listUsers, deleteUser, broadcastEmail };
