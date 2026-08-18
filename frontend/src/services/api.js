/**
 * api.js – Axios HTTP client
 *
 * A single pre-configured Axios instance used throughout the app.
 * Benefits:
 *  - Base URL is set once here; components just call api.get('/health')
 *  - Request interceptor attaches the auth token automatically
 *  - Response interceptor handles 401 errors globally
 */

import axios from 'axios';

// Auto-resolve base URL:
// 1. Env variable VITE_API_BASE_URL if set
// 2. In production (e.g. Vercel): default to the live Render backend
// 3. In local development: use '/api' (proxied by Vite)
let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
if (!rawBaseUrl && import.meta.env.PROD) {
  rawBaseUrl = 'https://codearena-api-77b3.onrender.com/api';
}
if (!rawBaseUrl) {
  rawBaseUrl = '/api';
}

// Clean up trailing slashes
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');

// Ensure /api is at the end if it's an absolute URL and missing /api
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Before every request: attach the JWT token if the user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codearena_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// After every response: handle common error cases globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/demo-login');

    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expired or invalid on protected route – clear storage
      localStorage.removeItem('codearena_token');
      localStorage.removeItem('codearena_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
