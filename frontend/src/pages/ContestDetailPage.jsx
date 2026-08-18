import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Calendar,
  Users,
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
  Play,
  ArrowLeft,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  Alert,
  Spinner,
} from '../components/ui';
import { getContest, getContestLeaderboard, registerForContest } from '../services/contestService';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';

export default function ContestDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cRes, lRes] = await Promise.allSettled([
          getContest(id),
          getContestLeaderboard(id),
        ]);
        if (cRes.status === 'fulfilled' && cRes.value?.data) {
          setContest(cRes.value.data);
        }
        if (lRes.status === 'fulfilled' && lRes.value?.data) {
          setLeaderboard(lRes.value.data);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      await registerForContest(id);
      setRegistered(true);
      setModalOpen(false);
      setAlertMsg('Successfully registered! Confirmation sent to your email.');
    } catch (err) {
      setAlertMsg(err.response?.data?.error || 'Registration failed.');
      setModalOpen(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get(`/contests/${id}/export`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(contest?.title || 'Contest').replace(/\s+/g, '_')}_Results.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setAlertMsg('Failed to export contest results.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Spinner size="lg" label="Loading contest details…" />
      </div>
    );
  }

  const currentContest = contest || {
    id: id || 'contest-default',
    title: 'CodeArena Algorithmic Challenge',
    description: 'Compete in timed algorithmic problem solving against peers.',
    status: 'PUBLISHED',
    duration: 120,
    start_time: new Date().toISOString(),
  };

  const isLive = (currentContest.status || '').toUpperCase() === 'LIVE';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      <Link
        to="/contests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-blue-500 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Contests
      </Link>

      {alertMsg && (
        <Alert variant="info" onClose={() => setAlertMsg(null)}>
          {alertMsg}
        </Alert>
      )}

      {/* Hero Banner */}
      <div className="rounded-3xl border border-theme bg-theme-card p-8 sm:p-10 shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={isLive ? 'live' : 'upcoming'}>
              {isLive ? '● LIVE CONTEST' : currentContest.status || 'UPCOMING'}
            </Badge>
            <span className="text-xs text-theme-muted font-mono">
              Duration: {currentContest.duration || 120} mins
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Export Excel Results Button */}
            <Button
              variant="outline"
              size="md"
              icon={<FileSpreadsheet size={15} className="text-emerald-500" />}
              onClick={handleExportExcel}
              title="Download Results as Excel Spreadsheet"
            >
              Export Results (Excel / CSV)
            </Button>

            {isLive ? (
              <Link to={`/contests/${currentContest.id}/arena`}>
                <Button variant="primary" size="md" icon={<Play size={14} />}>
                  Enter Arena
                </Button>
              </Link>
            ) : registered ? (
              <Badge variant="easy" size="md" icon={<CheckCircle2 size={13} />}>
                Registered
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => setModalOpen(true)}
                icon={<ArrowRight size={14} />}
              >
                Register For Contest
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-theme-main">{currentContest.title}</h1>
          <p className="text-sm text-theme-sub leading-relaxed max-w-3xl">
            {currentContest.description}
          </p>
        </div>

        <div className="pt-4 border-t border-theme flex flex-wrap items-center gap-6 text-xs text-theme-muted">
          <span>📅 Start Time: {new Date(currentContest.start_time).toLocaleString('en-IN')}</span>
          <span>•</span>
          <span>💻 Allowed: Python 3, C++, Java</span>
          <span>•</span>
          <span className="text-blue-500 font-bold">Rated Round</span>
        </div>
      </div>

      {/* Contest Leaderboard & Results Table */}
      <Card className="space-y-4">
        <CardHeader className="flex-row items-center justify-between pb-0">
          <div>
            <CardTitle>Live Contest Standings</CardTitle>
            <CardDescription>
              Rankings and score breakdowns for participating contestants
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={13} />}
            onClick={handleExportExcel}
          >
            Export Sheet
          </Button>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="py-12 text-center text-xs text-theme-muted space-y-1">
              <Trophy size={28} className="mx-auto text-theme-muted opacity-40 mb-2" />
              <p className="font-bold text-theme-main">No Submissions Recorded Yet</p>
              <p>Standings will update automatically as contestants solve problems in the arena.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-theme bg-theme-surface text-xs uppercase font-bold text-theme-muted tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Rank</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Problems Solved</th>
                    <th className="px-6 py-3.5 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {leaderboard.map((row, idx) => (
                    <tr key={row.user_id || idx} className="hover:bg-theme-surface/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold">#{row.rank || idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-theme-main">{row.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-theme-muted">{row.email}</td>
                      <td className="px-6 py-4 font-mono text-emerald-500 font-bold">
                        {row.solved ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-blue-500">
                        {row.score ?? 0} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Contest Registration"
        description="Verify your registration for this scheduled competition."
      >
        <div className="space-y-4 text-xs sm:text-sm text-theme-sub">
          <p>
            You are registering for <strong>{currentContest.title}</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-theme-muted">
            <li>A confirmation email will be sent to your registered address.</li>
            <li>Make sure you log in 5 minutes before the round starts.</li>
          </ul>
          <div className="flex justify-end gap-2 pt-4 border-t border-theme">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRegister}>
              Confirm Registration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
