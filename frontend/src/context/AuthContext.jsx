import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getMe,
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  sendOtpApi as apiSendOtp,
  verifyOtpApi as apiVerifyOtp,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('codearena_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('codearena_token') || null);
  const [loading, setLoading] = useState(true);

  const handleSetSession = (newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('codearena_token', newToken);
      localStorage.setItem('codearena_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } else {
      localStorage.removeItem('codearena_token');
      localStorage.removeItem('codearena_user');
      setToken(null);
      setUser(null);
    }
  };

  // Verify session on page load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('codearena_token');
      if (savedToken) {
        try {
          const res = await getMe();
          if (res.success && res.data) {
            const fresh = res.data;
            setUser(fresh);
            localStorage.setItem('codearena_user', JSON.stringify(fresh));
          }
        } catch {
          handleSetSession(null, null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLoginUser({ email, password });
      if (res.success && res.data) {
        handleSetSession(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Send 4-digit registration OTP
  const sendOtp = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiSendOtp({ name, email, password });
      return res;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete registration
  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await apiVerifyOtp({ email, otp });
      if (res.success && res.data) {
        handleSetSession(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.error || 'Verification failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register (student direct fallback)
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiRegisterUser({ name, email, password });
      if (res.success && res.data) {
        handleSetSession(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => handleSetSession(null, null);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    sendOtp,
    verifyOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
