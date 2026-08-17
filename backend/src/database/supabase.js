/**
 * supabase.js – Supabase PostgreSQL Client
 *
 * Initializes the Supabase client using environment variables.
 * Provides helper queries and graceful error handling if credentials
 * are missing or database connection fails.
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config/app');

let supabase = null;
let isConfigured = false;

if (config.supabaseUrl && (config.supabaseServiceRoleKey || config.supabaseAnonKey)) {
  const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
  supabase = createClient(config.supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  isConfigured = true;
  console.log(' Supabase client initialized');
} else {
  console.warn('⚠️ Supabase credentials not provided in .env yet. Running in offline/mock fallback mode.');
}

/**
 * Check if the database connection is healthy
 * @returns {Promise<{connected: boolean, message: string}>}
 */
async function checkDatabaseConnection() {
  if (!isConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in backend/.env',
    };
  }

  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return {
      connected: true,
      message: 'Successfully connected to Supabase PostgreSQL database',
    };
  } catch (err) {
    return {
      connected: false,
      message: `Database connection check failed: ${err.message}`,
    };
  }
}

module.exports = {
  supabase,
  isConfigured,
  checkDatabaseConnection,
};
