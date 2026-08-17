import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Code2,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert, Badge, Card } from '../components/ui';

export default function LoginPage() {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  // Already logged in
  if (isAuthenticated && user) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 animate-fade-in">
        <Card className="w-full max-w-sm text-center space-y-5 p-8">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-16 w-16 rounded-2xl mx-auto border-2 border-blue-500/50 bg-theme-surface shadow-lg"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">
                {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <Badge variant="easy" icon={<CheckCircle2 size={12} />}>Signed In</Badge>
            <h2 className="text-xl font-bold text-theme-main mt-2">{user.name}</h2>
            <p className="text-xs text-theme-muted mt-1 font-mono">{user.email}</p>
            {user.role === 'ADMIN' && (
              <div className="mt-2">
                <Badge variant="purple" icon={<Shield size={11} />}>Administrator</Badge>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={<ArrowRight size={16} />}
            onClick={() => navigate(from)}
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) { setError('Please enter your full name.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

      setLoading(true);
      const res = await register(name, email, password);
      setLoading(false);
      if (res.success) navigate(from, { replace: true });
      else setError(res.error);
    } else {
      if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }

      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (res.success) navigate(from, { replace: true });
      else setError(res.error);
    }
  };

  const handleSwitch = (m) => {
    setMode(m);
    setError(null);
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25">
            <Code2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-main tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs sm:text-sm text-theme-sub">
            {mode === 'login'
              ? 'Sign in to access your CodeArena challenges and contests.'
              : 'Register to join the CodeArena platform.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-theme-surface p-1 border border-theme">
          {[
            { key: 'login', label: 'Sign In' },
            { key: 'register', label: 'Register' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSwitch(key)}
              className={`w-1/2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <Alert variant="error" title="Authentication Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Main Card Form */}
        <Card className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Full Name"
                placeholder="e.g. Mukesh Kumar"
                icon={<User size={15} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@email.com"
              icon={<Mail size={15} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={15} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={mode === 'register' ? 'Minimum 6 characters' : undefined}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {mode === 'register' && (
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={15} />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              className="w-full mt-2"
            >
              {mode === 'login' ? 'Sign In to Account' : 'Create Student Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-theme-muted pt-4 border-t border-theme">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitch('register')}
                  className="text-blue-500 font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitch('login')}
                  className="text-blue-500 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
