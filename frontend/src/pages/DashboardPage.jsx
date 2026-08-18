import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  BookOpen,
  Shield,
  User,
  Play,
  Calendar,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Spinner,
  EmptyState,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getProblems } from '../services/problemService';
import { getContests } from '../services/contestService';
import api from '../services/api';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Live timer tick every second
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Coder';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [probRes, subRes, contestRes] = await Promise.allSettled([
          getProblems(),
          api.get('/submissions/my').catch(() => ({ data: { data: [] } })),
          getContests().catch(() => ({ data: [] })),
        ]);
        if (probRes.status === 'fulfilled' && probRes.value?.data) {
          setProblems(probRes.value.data.slice(0, 5));
        }
        if (subRes.status === 'fulfilled') {
          const subData = subRes.value?.data?.data || [];
          setRecentSubmissions(subData.slice(0, 6));
        }
        if (contestRes.status === 'fulfilled') {
          setContests(contestRes.value?.data || []);
        }
      } catch (_) {
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Determine active live contest vs next upcoming contest
  const liveContest = contests.find((c) => {
    const s = (c.status || '').toUpperCase();
    if (s === 'LIVE') return true;
    if (c.start_time && c.end_time) {
      const start = new Date(c.start_time).getTime();
      const end = new Date(c.end_time).getTime();
      return currentTime >= start && currentTime <= end;
    }
    return false;
  });

  const upcomingContests = contests
    .filter((c) => {
      const s = (c.status || '').toUpperCase();
      if (s === 'COMPLETED') return false;
      if (liveContest && c.id === liveContest.id) return false;
      const start = c.start_time ? new Date(c.start_time).getTime() : Infinity;
      return start > currentTime || s === 'PUBLISHED';
    })
    .sort((a, b) => new Date(a.start_time || 0) - new Date(b.start_time || 0));

  const nextContest = liveContest || upcomingContests[0] || null;

  // Calculate live countdown
  const getCountdown = (targetDate) => {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - currentTime;
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  };

  const nextContestCountdown = nextContest
    ? getCountdown(liveContest ? nextContest.end_time : nextContest.start_time)
    : null;

  const statusVariant = (s) => {
    if (s === 'Accepted') return 'easy';
    if (s === 'Wrong Answer') return 'hard';
    return 'upcoming';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-theme bg-theme-card p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-16 w-16 rounded-2xl border-2 border-blue-500/40 bg-theme-surface shadow-md object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-blue-500/40 shadow-md flex-shrink-0">
              <span className="text-white font-black text-xl">{initials}</span>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-theme-main">
                Welcome back, {firstName}!
              </h1>
              {isAdmin && (
                <Badge variant="purple" icon={<Shield size={11} />}>
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-theme-muted font-mono">{user?.email}</p>
            <p className="text-xs text-theme-sub">
              {user?.solvedCount ?? recentSubmissions.filter((s) => s.status === 'Accepted').length} challenges solved • Keep building streak! 🔥
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/practice">
            <Button variant="primary" size="md" icon={<Target size={15} />}>
              Solve Problems
            </Button>
          </Link>
          <Link to="/contests">
            <Button variant="outline" size="md" icon={<Trophy size={15} />}>
              View Contests
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="secondary" size="md" icon={<Shield size={15} />}>
                Admin Portal
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Live Contest Highlight Bar (if round is active right now) */}
      {liveContest && (
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <Badge variant="live">LIVE CONTEST IN PROGRESS</Badge>
              {nextContestCountdown && (
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Ends in {nextContestCountdown.h}h {nextContestCountdown.m}m {nextContestCountdown.s}s
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-theme-main">{liveContest.title}</h2>
            <p className="text-xs sm:text-sm text-theme-sub max-w-2xl">{liveContest.description}</p>
          </div>

          <Link to={`/contests/${liveContest.id}/arena`}>
            <Button variant="primary" size="lg" icon={<Play size={16} />} className="shadow-lg shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-500 border-none">
              Enter Arena Now →
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">Solved</span>
            <Code2 size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black text-theme-main font-mono">
            {user?.solvedCount ?? recentSubmissions.filter((s) => s.status === 'Accepted').length}
          </div>
          <span className="text-[11px] text-theme-muted block">Verified solutions</span>
        </Card>

        <Card className="p-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">Role</span>
            {isAdmin ? (
              <Shield size={18} className="text-purple-500" />
            ) : (
              <User size={18} className="text-emerald-500" />
            )}
          </div>
          <div className="text-2xl font-black text-theme-main">
            <span className={isAdmin ? 'text-purple-500' : 'text-emerald-500'}>
              {isAdmin ? 'Admin' : 'Student'}
            </span>
          </div>
          <span className="text-[11px] text-theme-muted block">
            {isAdmin ? 'Full system access' : 'Coder access'}
          </span>
        </Card>

        {/* Live dynamic contest card */}
        <Card className="p-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">
              {liveContest ? 'Live Now' : 'Next Contest'}
            </span>
            <Clock size={18} className={liveContest ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />
          </div>

          {liveContest ? (
            <>
              <div className="text-xl font-black text-emerald-500 font-mono">
                {nextContestCountdown ? `${nextContestCountdown.h}h ${nextContestCountdown.m}m ${nextContestCountdown.s}s` : 'Active'}
              </div>
              <span className="text-[11px] text-emerald-400 font-bold truncate block">
                {liveContest.title}
              </span>
            </>
          ) : nextContest && nextContestCountdown && !nextContestCountdown.expired ? (
            <>
              <div className="text-2xl font-black text-amber-500 font-mono">
                {nextContestCountdown.d > 0 ? `${nextContestCountdown.d}d ` : ''}
                {nextContestCountdown.h}h {nextContestCountdown.m}m
              </div>
              <span className="text-[11px] text-theme-muted truncate block">
                {nextContest.title}
              </span>
            </>
          ) : (
            <>
              <div className="text-xl font-black text-theme-muted font-mono">
                None Active
              </div>
              <span className="text-[11px] text-theme-muted block">Stay tuned for rounds</span>
            </>
          )}
        </Card>

        <Card className="p-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">Recent Activity</span>
            <CheckCircle2 size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black text-theme-main font-mono">
            {recentSubmissions.length}
          </div>
          <span className="text-[11px] text-theme-muted block">Attempts recorded</span>
        </Card>
      </div>

      {/* Admin Quick Panel */}
      {isAdmin && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-purple-500" />
              <h2 className="text-sm font-bold text-theme-main">Administrator Controls</h2>
            </div>
            <Badge variant="purple" size="sm">Admin Only</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin">
              <Button variant="primary" size="sm" icon={<Shield size={13} />}>
                Admin Portal & Broadcast
              </Button>
            </Link>
            <Link to="/admin/problems">
              <Button variant="secondary" size="sm" icon={<Code2 size={13} />}>
                Manage Problems & Testcases
              </Button>
            </Link>
            <Link to="/admin/contests">
              <Button variant="secondary" size="sm" icon={<Trophy size={13} />}>
                Schedule Contests
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Submissions & Practice Split Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-0">
              <div>
                <CardTitle>Your Recent Submissions</CardTitle>
                <CardDescription>Execution results recorded for {user?.name}</CardDescription>
              </div>
              <Link to="/submissions" className="text-xs text-blue-500 font-bold hover:underline">
                View All →
              </Link>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="py-12 text-center">
                  <Spinner size="md" label="Loading attempts…" />
                </div>
              ) : recentSubmissions.length === 0 ? (
                <EmptyState
                  icon={<Code2 size={24} />}
                  title="No submissions yet"
                  description="Solve challenges to track your progress and stats."
                  actionLabel="Solve Problems"
                  onAction={() => (window.location.href = '/practice')}
                />
              ) : (
                <div className="divide-y divide-theme">
                  {recentSubmissions.map((sub, i) => (
                    <div key={sub.id || i} className="py-3.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <Link
                          to={`/practice/${sub.problem_id}`}
                          className="font-bold text-theme-main hover:text-blue-500 transition-colors block"
                        >
                          {sub.problem_title || sub.problem_id}
                        </Link>
                        <span className="text-theme-muted">
                          {sub.language?.toUpperCase()} • {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-IN') : 'Recent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {sub.execution_time && (
                          <span className="text-theme-muted font-mono text-[11px]">
                            {sub.execution_time}ms
                          </span>
                        )}
                        <Badge variant={statusVariant(sub.status)} size="sm">{sub.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recommendations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                <CardTitle className="text-base">Recommended Practice</CardTitle>
              </div>
              <CardDescription>Curated challenges for your level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {problems.length > 0 ? (
                problems.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-theme bg-theme-surface space-y-1.5 hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/practice/${rec.id}`}
                        className="text-xs font-bold text-theme-main hover:text-blue-500 transition-colors block"
                      >
                        {rec.title}
                      </Link>
                      <Badge variant={(rec.difficulty || 'easy').toLowerCase()} size="sm">
                        {rec.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-theme-muted pt-1">
                      <span className="text-blue-500 font-semibold">{rec.topic}</span>
                      <span className="font-mono text-amber-500 font-bold">{rec.points || 100} pts</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-theme-muted py-4 text-center">
                  Check back for new problems!
                </p>
              )}
              <Link to="/practice">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Browse All Problems →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
