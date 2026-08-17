import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Code2,
  Menu,
  X,
  Trophy,
  Target,
  BarChart2,
  Clock,
  LogOut,
  Shield,
  LogIn,
  ChevronDown,
  Bell,
  Check,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge, Button, ThemeToggle } from '../ui';
import { getNotifications, markNotificationAsRead } from '../../services/notificationService';

const navLinks = [
  { label: 'Contests', path: '/contests', icon: <Trophy size={15} /> },
  { label: 'Practice', path: '/practice', icon: <Target size={15} /> },
  { label: 'Leaderboard', path: '/leaderboard', icon: <BarChart2 size={15} /> },
  { label: 'Submissions', path: '/submissions', icon: <Clock size={15} /> },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      getNotifications()
        .then((res) => {
          if (res?.data) {
            setNotifications(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-50 border-b border-theme bg-nav-blur backdrop-blur-xl transition-colors duration-200" style={{ backgroundColor: 'var(--nav-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-17 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group text-decoration-none">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-200">
            <Code2 size={22} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            CodeArena
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-theme-sub hover:text-theme-main hover:bg-theme-surface'
              }`}
            >
              {link.icon && <span className="opacity-80">{link.icon}</span>}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Actions: ThemeToggle + Notifications + Profile */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setDropdownOpen(false);
                  }}
                  className="relative p-2 rounded-xl border border-theme bg-theme-surface text-theme-sub hover:text-theme-main transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-theme bg-theme-card p-4 shadow-xl animate-fade-in z-50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-theme">
                      <span className="text-xs font-bold text-theme-main">Notifications</span>
                      <span className="text-[11px] text-theme-muted">{unreadCount} unread</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 divide-y divide-theme">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`pt-2 text-xs space-y-1 ${
                              n.is_read ? 'opacity-60' : 'opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-theme-main">{n.title}</span>
                              {!n.is_read && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkRead(n.id)}
                                  className="text-[10px] text-blue-500 hover:underline cursor-pointer"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                            <p className="text-theme-sub text-[11px] leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-theme-muted py-6 text-center">
                          No notifications yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-theme-surface border border-transparent hover:border-theme transition-all cursor-pointer"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-8.5 w-8.5 rounded-xl bg-theme-surface border border-blue-500/40 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border border-blue-500/40 flex-shrink-0">
                      <span className="text-white text-xs font-black">{initials}</span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-theme-main leading-none">{user.name}</span>
                      {isAdmin && <Badge variant="purple" size="sm">Admin</Badge>}
                    </div>
                    <span className="text-[10px] text-theme-muted leading-none font-mono block mt-0.5">{user.email}</span>
                  </div>
                  <ChevronDown size={14} className="text-theme-muted hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-theme bg-theme-card p-2 shadow-2xl animate-fade-in z-50 space-y-1">
                    <div className="px-3 py-2.5 border-b border-theme">
                      <p className="text-xs font-bold text-theme-main">{user.name}</p>
                      <p className="text-[11px] text-theme-muted truncate font-mono">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-theme-sub hover:text-theme-main hover:bg-theme-surface transition-colors"
                    >
                      <User size={14} />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-theme-sub hover:text-theme-main hover:bg-theme-surface transition-colors"
                    >
                      <Trophy size={14} />
                      <span>Profile & Stats</span>
                    </Link>

                    <Link
                      to="/submissions"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-theme-sub hover:text-theme-main hover:bg-theme-surface transition-colors"
                    >
                      <Clock size={14} />
                      <span>Submissions History</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-500 dark:text-purple-400 hover:bg-purple-500/10 border-t border-theme mt-1 transition-colors"
                      >
                        <Shield size={14} />
                        <span>Admin Portal</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer border-t border-theme mt-1"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm" icon={<LogIn size={14} />}>
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl border border-theme bg-theme-surface text-theme-sub hover:text-theme-main transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-theme bg-theme-card px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                isActive(link.path)
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-theme-sub hover:bg-theme-surface'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-theme space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-theme-sub hover:bg-theme-surface"
              >
                <User size={15} />
                <span>Dashboard</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-purple-500 dark:text-purple-400 hover:bg-theme-surface"
                >
                  <Shield size={15} />
                  <span>Admin Portal</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-theme">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Sign In / Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
