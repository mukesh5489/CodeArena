/**
 * authService.js – Authentication API client
 */

import api from './api';

/**
 * Send 4-digit OTP to user email for new registration
 * @param {Object} payload - { name, email, password }
 */
export const sendOtpApi = async (payload) => {
  const res = await api.post('/auth/send-otp', payload);
  return res.data;
};

/**
 * Verify 4-digit OTP and complete registration
 * @param {Object} payload - { email, otp }
 */
export const verifyOtpApi = async (payload) => {
  const res = await api.post('/auth/verify-otp', payload);
  return res.data;
};

/**
 * Register a new user with Name, Email & Password (direct fallback)
 * @param {Object} payload - { name, email, password }
 */
export const registerUser = async (payload) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};

/**
 * Log in with registered Email & Password
 * @param {Object} payload - { email, password }
 */
export const loginUser = async (payload) => {
  const res = await api.post('/auth/login', payload);
  return res.data;
};

/**
 * 1-Click Demo Login
 * @param {('STUDENT'|'ADMIN')} role
 */
export const demoLogin = async (role = 'STUDENT') => {
  const res = await api.post('/auth/demo-login', { role });
  return res.data;
};

/**
 * Fetch current user profile
 */
export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

/**
 * Logout
 */
export const logoutApi = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};
