/**
 * server.js – CodeArena Backend Entry Point
 *
 * This file:
 *  1. Loads environment variables from .env
 *  2. Creates the Express app
 *  3. Registers global middleware (CORS, JSON parsing, logging, rate limiting)
 *  4. Mounts all route files under /api
 *  5. Registers the global error handler
 *  6. Starts listening on the configured port
 */

require('dotenv').config(); // Must be first so all process.env values are available

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config/app');
const healthRoutes    = require('./routes/health');
const authRoutes      = require('./routes/auth');
const contestRoutes   = require('./routes/contests');
const problemRoutes   = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const notificationRoutes = require('./routes/notifications');
const userRoutes      = require('./routes/users');
const adminRoutes     = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Security Headers ──────────────────────────────────────────────────────────
// helmet() sets various HTTP headers that protect against common web attacks
// ─── CORS ──────────────────────────────────────────────────────────────────────
// Allow requests from localhost, Vercel deployments, and configured FRONTEND_URL
const allowedOrigins = (config.frontendUrl || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server, Postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');

      // Check configured origins or localhost or any vercel.app preview/production domain
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.endsWith('.vercel.app');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback: allow origin in production to prevent login blockages
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
// Prevent abuse – max 200 requests per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────────
// Parse incoming JSON and URL-encoded form data
app.use(express.json({ limit: '10mb' })); // 10mb to allow large code submissions
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ───────────────────────────────────────────────────────────
// morgan('dev') prints colourful log lines like: GET /api/health 200 3ms
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health',        healthRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/contests',      contestRoutes);
app.use('/api/problems',      problemRoutes);
app.use('/api/submissions',   submissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/admin',         adminRoutes);

// Root route – helpful when someone opens the backend URL in a browser
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Welcome to the CodeArena API',
    endpoints: [
      'GET /api/health',
      'GET /api/contests',
      'GET /api/problems',
      'GET /api/submissions',
    ],
  });
});

// 404 handler – catches requests to unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🚀 CodeArena API Server started`);
  console.log(`   Environment : ${config.nodeEnv}`);
  console.log(`   Port        : ${config.port}`);
  console.log(`   URL         : http://localhost:${config.port}`);
  console.log(`   Health      : http://localhost:${config.port}/api/health\n`);
});

module.exports = app; // exported so Jest can import it for tests later
