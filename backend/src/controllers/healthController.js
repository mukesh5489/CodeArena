// Health check controller
// Returns server status, uptime, and environment – useful for verifying the API is alive

const { checkDatabaseConnection, isConfigured } = require('../database/supabase');

const getHealth = async (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  const dbStatus = await checkDatabaseConnection();

  res.json({
    success: true,
    message: 'CodeArena API is running',
    data: {
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      database: {
        configured: isConfigured,
        connected: dbStatus.connected,
        message: dbStatus.message,
      },
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

module.exports = { getHealth };
