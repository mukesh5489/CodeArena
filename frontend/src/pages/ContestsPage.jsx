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
} from 'lucide-react';
import { Button, Badge, Card, Spinner, EmptyState } from '../components/ui';
import { getContests } from '../services/contestService';
import { useAuth } from '../context/AuthContext';

export default function ContestsPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadData();
  }, []);

  const filtered = contests.filter((c) => {
    const s = (c.status || 'PUBLISHED').toUpperCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'live') return s === 'LIVE';
    if (activeTab === 'upcoming') return s === 'PUBLISHED';
    if (activeTab === 'completed') return s === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || 'PUBLISHED').toUpperCase();
    if (s === 'LIVE') return <Badge variant="live">LIVE NOW</Badge>;
    if (s === 'PUBLISHED') return <Badge variant="upcoming">UPCOMING</Badge>;
    return <Badge variant="completed">COMPLETED</Badge>;
  };

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
          title="No Contests Scheduled Yet"
          description="Contests scheduled by the administrator will appear here live with countdowns and arena registration."
          actionLabel={isAdmin ? 'Schedule a Contest in Admin' : 'Practice Problems'}
          onAction={() => (window.location.href = isAdmin ? '/admin/contests' : '/practice')}
        />
      ) : (
        <div className="grid gap-6">
          {filtered.map((c) => {
            const isLive = (c.status || '').toUpperCase() === 'LIVE';
            const participants = c.contest_participants?.[0]?.count || c.participants || 0;

            return (
              <Card
                key={c.id}
                hover
                className={`p-8 sm:p-10 space-y-6 transition-all duration-300 ${
                  isLive ? 'border-emerald-500/40 bg-emerald-500/5' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusBadge(c.status)}
                      <span className="text-xs text-theme-muted flex items-center gap-1 font-mono">
                        <Clock size={14} /> {c.duration} mins
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
                        <Button variant="primary" size="md" icon={<Play size={14} />} className="shadow-lg shadow-blue-500/25">
                          Enter Arena
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
