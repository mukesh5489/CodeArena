import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  Plus,
  Flame,
} from 'lucide-react';
import { Button, Badge, Card, Spinner, EmptyState } from '../components/ui';
import { getContests } from '../services/contestService';
import { useAuth } from '../context/AuthContext';

export default function ContestsPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getContests();
      setContests(res?.data || []);
    } catch (err) {
      console.warn('Failed to load contests');
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getContestTimeInfo = (contest) => {
    if (!contest.start_time) return { label: 'Scheduled Soon', isLive: false };

    const start = new Date(contest.start_time).getTime();
    const end = contest.end_time
      ? new Date(contest.end_time).getTime()
      : start + (contest.duration || 120) * 60 * 1000;

    if (currentTime >= start && currentTime <= end) {
      const diff = end - currentTime;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return {
        label: `Ends in ${h}h ${m}m ${s}s`,
        isLive: true,
        isCompleted: false,
      };
    }

    if (currentTime > end) {
      return {
        label: 'Ended',
        isLive: false,
        isCompleted: true,
      };
    }

    // Upcoming
    const diff = start - currentTime;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const timeStr = d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`;
    return {
      label: `Starts in ${timeStr}`,
      isLive: false,
      isCompleted: false,
    };
  };

  const filtered = contests.filter((c) => {
    const timeInfo = getContestTimeInfo(c);
    const isLive = timeInfo.isLive || (c.status || '').toUpperCase() === 'LIVE';
    const isPast = timeInfo.isCompleted || (c.status || '').toUpperCase() === 'COMPLETED';

    if (activeTab === 'all') return true;
    if (activeTab === 'live') return isLive;
    if (activeTab === 'upcoming') return !isLive && !isPast;
    if (activeTab === 'completed') return isPast;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-fade-in">
      {/* Header with generous spacing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-theme pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Trophy size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight">
              Programming Contests
            </h1>
          </div>
          <p className="text-sm text-theme-sub max-w-xl">
            Compete live against other coders, solve algorithmic problems against the clock, and earn rating points.
          </p>
        </div>

        {isAdmin && (
          <Link to="/admin/contests">
            <Button variant="primary" size="md" icon={<Plus size={16} />}>
              Schedule New Contest
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-theme-surface rounded-2xl border border-theme w-fit">
        {[
          { id: 'all', label: 'All Contests' },
          { id: 'live', label: 'Live Now' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Past Contests' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <Spinner size="lg" label="Loading contests…" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Trophy size={32} />}
          title="No Contests in this category"
          description="Contests scheduled by the administrator will appear here live with dynamic countdowns and registration."
          actionLabel={isAdmin ? 'Schedule a Contest in Admin' : 'Practice Problems'}
          onAction={() => (window.location.href = isAdmin ? '/admin/contests' : '/practice')}
        />
      ) : (
        <div className="grid gap-6">
          {filtered.map((c) => {
            const timeInfo = getContestTimeInfo(c);
            const isLive = timeInfo.isLive || (c.status || '').toUpperCase() === 'LIVE';
            const isPast = timeInfo.isCompleted || (c.status || '').toUpperCase() === 'COMPLETED';
            const participants = c.contest_participants?.[0]?.count || c.participants || 0;

            return (
              <Card
                key={c.id}
                hover
                className={`p-8 sm:p-10 space-y-6 transition-all duration-300 ${
                  isLive ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {isLive ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          LIVE NOW
                        </span>
                      ) : isPast ? (
                        <Badge variant="completed">COMPLETED</Badge>
                      ) : (
                        <Badge variant="upcoming">UPCOMING</Badge>
                      )}

                      <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <Clock size={12} /> {timeInfo.label}
                      </span>

                      <span className="text-xs text-theme-muted flex items-center gap-1 font-mono">
                        {c.duration || 120} mins
                      </span>
                      <span className="text-xs text-theme-muted flex items-center gap-1">
                        <Users size={14} /> {participants} registered
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-theme-main tracking-tight">
                      {c.title}
                    </h3>
                    <p className="text-sm text-theme-sub leading-relaxed max-w-3xl">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 sm:pt-0">
                    <Link to={`/contests/${c.id}`}>
                      <Button variant="outline" size="md">
                        View Details
                      </Button>
                    </Link>
                    {isLive ? (
                      <Link to={`/contests/${c.id}/arena`}>
                        <Button variant="primary" size="md" icon={<Play size={14} />} className="shadow-lg shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-500 border-none">
                          Enter Arena
                        </Button>
                      </Link>
                    ) : isPast ? (
                      <Link to={`/contests/${c.id}`}>
                        <Button variant="secondary" size="md">
                          Leaderboard
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/contests/${c.id}`}>
                        <Button variant="primary" size="md" icon={<ArrowRight size={14} />}>
                          Register
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-theme text-xs text-theme-muted">
                  <div className="flex items-center gap-4">
                    <span>
                      📅{' '}
                      {c.start_time
                        ? new Date(c.start_time).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Scheduled Soon'}
                    </span>
                    <span>•</span>
                    <span>💻 Python, C++, Java</span>
                  </div>
                  <span className="font-bold text-blue-500">Rated Round</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
