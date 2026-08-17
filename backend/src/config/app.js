// App-wide configuration constants
// All values come from environment variables so secrets never live in source code

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // JWT – used later when we add authentication
  jwtSecret: process.env.JWT_SECRET || 'changeme_in_production',
  jwtExpiresIn: '7d',

  // Supabase – used later when we connect the database
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Google OAuth – used later
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  // Judge0 – code execution service
  judge0ApiUrl: process.env.JUDGE0_API_URL || '',
  judge0ApiKey: process.env.JUDGE0_API_KEY || '',

  // Resend – email service
  resendApiKey: process.env.RESEND_API_KEY || '',

  // Gmail SMTP – email service
  smtpUser: process.env.SMTP_USER || 'saimukesh363@gmail.com',
  smtpPass: process.env.SMTP_PASS || 'ehtt jkmx vqij ovbf',
};


module.exports = config;
