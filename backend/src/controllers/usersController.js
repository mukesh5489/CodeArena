/**
 * usersController.js – User Management, Platform Stats & Leaderboard
 */

const { supabase, isConfigured } = require('../database/supabase');

/**
 * GET /api/users/leaderboard
 * Returns all registered users sorted by accepted submissions count
 */
async function getLeaderboard(req, res) {
  try {
    if (isConfigured && supabase) {
      // Get all users
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, role, created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get accepted submission counts per user
      const { data: subCounts, error: subError } = await supabase
        .from('submissions')
        .select('user_id')
        .eq('status', 'Accepted');

      const countMap = {};
      if (subCounts) {
        for (const s of subCounts) {
          countMap[s.user_id] = (countMap[s.user_id] || 0) + 1;
        }
      }

      const ranked = (users || [])
        .map((u) => ({ ...u, solved_count: countMap[u.id] || 0 }))
        .sort((a, b) => b.solved_count - a.solved_count);

      return res.json({ success: true, data: ranked });
    }

    return res.json({ success: true, data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/users/stats
 * Returns real database statistics for public consumption (coders, problems, contests, submissions)
 */
async function getPlatformStats(req, res) {
  try {
    if (isConfigured && supabase) {
      const [uRes, pRes, cRes, sRes] = await Promise.allSettled([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('problems').select('*', { count: 'exact', head: true }),
        supabase.from('contests').select('*', { count: 'exact', head: true }),
        supabase.from('submissions').select('*', { count: 'exact', head: true }),
      ]);

      const totalUsers = uRes.status === 'fulfilled' ? (uRes.value.count || 0) : 0;
      const totalProblems = pRes.status === 'fulfilled' ? (pRes.value.count || 0) : 0;
      const totalContests = cRes.status === 'fulfilled' ? (cRes.value.count || 0) : 0;
      const totalSubmissions = sRes.status === 'fulfilled' ? (sRes.value.count || 0) : 0;

      return res.json({
        success: true,
        data: {
          users: totalUsers,
          problems: totalProblems,
          contests: totalContests,
          submissions: totalSubmissions,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        users: 0,
        problems: 0,
        contests: 0,
        submissions: 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getLeaderboard, getPlatformStats };
