/**
 * authController.js – Authentication & Session Management
 *
 * ADMIN ACCOUNT: admin2026@gmail.com / admin@2026 (hardcoded, locked)
 * All other accounts are regular students registered via email + password.
 *
 * POST /api/auth/send-otp    – Send 4-digit OTP to email for new registration
 * POST /api/auth/verify-otp  – Verify OTP and create account
 * POST /api/auth/register    – Register as a student (no OTP, legacy)
 * POST /api/auth/login       – Sign in with email + password
 * GET  /api/auth/me          – Current user session details
 * POST /api/auth/logout      – Sign out
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase, isConfigured } = require('../database/supabase');
const config = require('../config/app');
const { sendOtpEmail } = require('../services/emailService');

// ─── Hardcoded Admin Credentials (ONLY these credentials get Admin access) ───
const ADMIN_EMAIL = 'admin2026@gmail.com';
const ADMIN_PASSWORD = 'admin@2026';

// ─── In-memory OTP store (survives for duration of server process) ─────────
// Format: { [email]: { otp, name, password_hash, expiresAt } }
const otpStore = new Map();

/**
 * Generate a signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      role: user.role || 'USER',
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn || '7d' }
  );
}

/**
 * POST /api/auth/send-otp
 * Body: { name, email, password }
 * Generates a 4-digit OTP, stores it temporarily, sends to email
 */
async function sendOtp(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, email address, and a password.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Block admin email
    if (trimmedEmail === ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        error: 'This email is reserved. Please use a different email address.',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    // Check if email already registered
    if (isConfigured && supabase) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', trimmedEmail)
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
        });
      }
    }

    // Generate 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Store OTP (10 minute expiry)
    otpStore.set(trimmedEmail, {
      otp,
      name: trimmedName,
      password_hash,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP email
    const emailResult = await sendOtpEmail({ to: trimmedEmail, name: trimmedName, otp });

    if (!emailResult.success && !emailResult.simulated) {
      // Clean up store on email failure
      otpStore.delete(trimmedEmail);
      return res.status(500).json({
        success: false,
        error: `Failed to send verification email: ${emailResult.error}. Please check your email address.`,
      });
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${trimmedEmail}. Please check your inbox.`,
      // In dev/simulated mode, include OTP for testing
      ...(emailResult.simulated ? { devOtp: otp } : {}),
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to send OTP: ${err.message}`,
    });
  }
}

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }
 * Verifies OTP and creates the user account
 */
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your email and the verification code.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const stored = otpStore.get(trimmedEmail);

    if (!stored) {
      return res.status(400).json({
        success: false,
        error: 'No pending verification found for this email. Please restart registration.',
      });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(trimmedEmail);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please register again.',
      });
    }

    if (stored.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Incorrect verification code. Please try again.',
      });
    }

    // OTP is valid — create the user
    otpStore.delete(trimmedEmail);

    const avatar_url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(stored.name)}`;
    let user = null;

    if (isConfigured && supabase) {
      let insertPayload = {
        name: stored.name,
        email: trimmedEmail,
        password_hash: stored.password_hash,
        avatar_url,
        role: 'USER',
      };

      let { data: newUser, error } = await supabase
        .from('users')
        .insert(insertPayload)
        .select('id, name, email, avatar_url, role')
        .single();

      if (error && error.message?.includes('password_hash')) {
        delete insertPayload.password_hash;
        const retry = await supabase
          .from('users')
          .insert(insertPayload)
          .select('id, name, email, avatar_url, role')
          .single();
        newUser = retry.data;
        error = retry.error;
      }

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            success: false,
            error: 'An account with this email already exists. Please sign in instead.',
          });
        }
        throw error;
      }

      user = newUser;
    } else {
      user = {
        id: `user_${Date.now()}`,
        name: stored.name,
        email: trimmedEmail,
        avatar_url,
        role: 'USER',
      };
    }

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: `Welcome to CodeArena, ${stored.name}! Your account has been verified and created.`,
      data: { token, user },
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({
      success: false,
      error: `Verification failed: ${err.message}`,
    });
  }
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * NOTE: Anyone registering with admin2026@gmail.com is BLOCKED — that's a reserved admin account.
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, email address, and a password.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Block registration with admin email
    if (trimmedEmail === ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        error: 'This email is reserved. Please use a different email address.',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const avatar_url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`;

    let user = null;

    if (isConfigured && supabase) {
      // Check if email is already registered
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', trimmedEmail)
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
        });
      }

      let insertPayload = {
        name: trimmedName,
        email: trimmedEmail,
        password_hash,
        avatar_url,
        role: 'USER',
      };

      let { data: newUser, error } = await supabase
        .from('users')
        .insert(insertPayload)
        .select('id, name, email, avatar_url, role')
        .single();

      if (error && error.message?.includes('password_hash')) {
        delete insertPayload.password_hash;
        const retry = await supabase
          .from('users')
          .insert(insertPayload)
          .select('id, name, email, avatar_url, role')
          .single();
        newUser = retry.data;
        error = retry.error;
      }

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            success: false,
            error: 'An account with this email already exists. Please sign in instead.',
          });
        }
        throw error;
      }

      user = newUser;
    } else {
      user = {
        id: `user_${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        avatar_url,
        role: 'USER',
      };
    }

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to CodeArena.',
      data: { token, user },
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      success: false,
      error: `Registration failed: ${err.message}`,
    });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both your email and password.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ── ADMIN HARDCODED CHECK ─────────────────────────────────────────────────
    if (trimmedEmail === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
          success: false,
          error: 'Invalid admin credentials.',
        });
      }

      let adminUser = null;
      if (isConfigured && supabase) {
        const { data } = await supabase
          .from('users')
          .select('id, name, email, avatar_url, role')
          .eq('email', ADMIN_EMAIL)
          .single();
        adminUser = data;
      }

      if (!adminUser) {
        adminUser = {
          id: 'admin-hardcoded-id',
          name: 'Admin',
          email: ADMIN_EMAIL,
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin2026',
          role: 'ADMIN',
        };
      }

      adminUser.role = 'ADMIN';

      const token = generateToken(adminUser);
      return res.json({
        success: true,
        message: 'Signed in as Administrator.',
        data: { token, user: adminUser },
      });
    }

    // ── STUDENT LOGIN ─────────────────────────────────────────────────────────
    if (isConfigured && supabase) {
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', trimmedEmail)
        .single();

      if (error || !dbUser) {
        return res.status(401).json({
          success: false,
          error: 'No registered account found with this email.',
        });
      }

      if (dbUser.password_hash) {
        const isMatch = await bcrypt.compare(password, dbUser.password_hash);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            error: 'Incorrect password. Please try again.',
          });
        }
      }

      const user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatar_url: dbUser.avatar_url,
        role: 'USER',
      };

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Signed in successfully!',
        data: { token, user },
      });
    }

    // Offline fallback
    const fallback = {
      id: `offline_${Date.now()}`,
      name: trimmedEmail.split('@')[0],
      email: trimmedEmail,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedEmail)}`,
      role: 'USER',
    };
    const token = generateToken(fallback);
    return res.json({ success: true, message: 'Signed in (offline mode)', data: { token, user: fallback } });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      success: false,
      error: `Login failed: ${err.message}`,
    });
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const userId = req.user.id;
    let profile = { ...req.user };

    if (profile.email === ADMIN_EMAIL) {
      profile.role = 'ADMIN';
    }

    if (isConfigured && supabase && userId !== 'admin-hardcoded-id') {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (dbUser) {
        profile = { ...profile, ...dbUser };
        profile.role = profile.email === ADMIN_EMAIL ? 'ADMIN' : 'USER';
      }

      const { count: solvedCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'Accepted');

      profile.solvedCount = solvedCount || 0;
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  return res.json({ success: true, message: 'Logged out successfully.' });
}

module.exports = { sendOtp, verifyOtp, register, login, getMe, logout };
