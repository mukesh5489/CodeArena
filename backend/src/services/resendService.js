/**
 * resendService.js – Transactional Email Service
 * Re-exports the Gmail SMTP email service
 */

const { sendContestRegistrationEmail, sendMail } = require('./emailService');

module.exports = {
  sendContestRegistrationEmail,
  sendMail,
};
