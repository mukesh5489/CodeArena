/**
 * emailService.js – Transactional & Broadcast Email Dispatcher
 *
 * Uses Nodemailer with Gmail SMTP (saimukesh363@gmail.com)
 * Supports:
 *  - OTP verification emails for new user registration
 *  - Broadcast announcements to all registered users
 *  - Contest registration confirmations
 *  - Reminder notifications
 */

const nodemailer = require('nodemailer');
const config = require('../config/app');

// Create reusable transporter object using Gmail SMTP with explicit port 587
let transporter = null;

function createTransporter() {
  const user = (config.smtpUser || '').replace(/\s+/g, '');
  const pass = (config.smtpPass || '').replace(/\s+/g, '');

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

transporter = createTransporter();

/**
 * Send an email to a single recipient
 */
async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`\n📧 [EMAIL SIMULATED - No SMTP configured] To: ${to} | Subject: "${subject}"`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"CodeArena" <${(config.smtpUser || '').replace(/\s+/g, '')}>`,
      to,
      subject,
      text: text || subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email dispatch error to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send a 4-digit OTP verification email to a new registrant
 */
async function sendOtpEmail({ to, name, otp }) {
  const subject = `${otp} — Your CodeArena Verification Code`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background-color: #0a0f1e; color: #f1f5f9; padding: 36px; border-radius: 16px; border: 1px solid #1e2d4a;">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #3b82f6; font-size: 26px; margin: 0; font-weight: 900; letter-spacing: -0.5px;">CodeArena</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Competitive Programming Platform</p>
      </div>

      <div style="background-color: #111827; border-radius: 12px; padding: 28px; border: 1px solid #1e2d4a; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">Hi <strong style="color:#f1f5f9;">${name}</strong>, use this code to verify your email</p>

        <div style="display: inline-block; margin: 20px auto; background: linear-gradient(135deg, #1e3a8a, #2563eb); border-radius: 12px; padding: 20px 40px; letter-spacing: 12px;">
          <span style="font-size: 40px; font-weight: 900; color: #ffffff; font-family: 'Courier New', monospace;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">This code expires in <strong style="color:#f59e0b;">10 minutes</strong>. Don't share it with anyone.</p>
      </div>

      <p style="text-align: center; color: #475569; font-size: 12px; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email.<br/>
        © CodeArena Platform
      </p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

/**
 * Send contest registration confirmation email
 */
async function sendContestRegistrationEmail({ userEmail, userName, contestTitle, startTime }) {
  const subject = `Registration Confirmed: ${contestTitle} | CodeArena`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0f1e; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid #1e2d4a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #3b82f6; font-size: 28px; margin: 0; font-weight: 800;">CodeArena</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Competitive Programming Platform</p>
      </div>

      <div style="background-color: #111827; border-radius: 12px; padding: 24px; border: 1px solid #1e2d4a; margin-bottom: 24px;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Hi ${userName}, you're registered! 🚀</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          You have successfully registered for <strong>${contestTitle}</strong>.
        </p>

        <div style="background-color: #0d1527; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">Contest Start Time:</p>
          <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 600; color: #f1f5f9;">${startTime}</p>
        </div>

        <ul style="color: #94a3b8; font-size: 13px; line-height: 1.8; padding-left: 20px;">
          <li>Allowed Languages: Python 3, C++ (GCC), Java (OpenJDK)</li>
          <li>Each wrong submission before acceptance incurs a 10-minute penalty.</li>
          <li>Make sure you are logged in 5 minutes prior to the start time.</li>
        </ul>
      </div>

      <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
        CodeArena Platform • Good luck with your competition!
      </p>
    </div>
  `;

  return sendMail({ to: userEmail, subject, html });
}

module.exports = {
  sendMail,
  sendOtpEmail,
  sendContestRegistrationEmail,
};
