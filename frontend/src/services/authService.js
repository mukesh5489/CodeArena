/**
 * authService.js – Authentication API client
 */

import api from './api';

/**
 * Register a new user with Name, Email & Password
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
