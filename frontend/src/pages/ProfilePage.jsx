import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Target,
  Shield,
  Code2,
  Layers,
  Award,
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
import api from '../services/api';

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently Joined';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const subRes = await api.get('/submissions/my').catch(() => ({ data: { data: [] } }));
        setSubmissions(subRes?.data?.data || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const accepted = submissions.filter((s) => s.status === 'Accepted');
  const wrongAnswer = submissions.filter((s) => s.status === 'Wrong Answer');
  const accuracy = submissions.length > 0
    ? `${Math.round((accepted.length / submissions.length) * 100)}%`
    : '100%';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      {/* Profile Banner */}
      <div className="rounded-3xl border border-theme bg-theme-card p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user?.name}
                className="h-20 w-20 rounded-2xl border-2 border-blue-500/40 bg-theme-surface shadow-md object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-blue-500/40 shadow-md flex-shrink-0">
                <span className="text-white font-black text-2xl">{initials}</span>
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-theme-main">{user?.name || 'User'}</h1>
                {isAdmin ? (
                  <Badge variant="purple" icon={<Shield size={11} />}>Administrator</Badge>
                ) : (
                  <Badge variant="blue" icon={<User size={11} />}>Coder</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-theme-muted pt-1 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {user?.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> Joined {joinDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/practice">
              <Button variant="primary" size="md" icon={<Target size={15} />}>
                Practice Problems
              </Button>
            </Link>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-theme">
          <div className="space-y-0.5">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">Total Submissions</span>
            <span className="text-2xl font-black font-mono text-theme-main block">
              {submissions.length}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">Accepted Solves</span>
            <span className="text-2xl font-black font-mono text-emerald-500 block">
              {accepted.length}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">Wrong Answers</span>
            <span className="text-2xl font-black font-mono text-rose-500 block">
              {wrongAnswer.length}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-theme-muted font-bold uppercase tracking-wider">Accuracy Rate</span>
            <span className="text-2xl font-black font-mono text-blue-500 block">
              {accuracy}
            </span>
          </div>
        </div>
      </div>

      {/* Submissions History on Profile */}
      <Card className="space-y-4">
        <CardHeader className="flex-row items-center justify-between pb-0">
          <div>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest code submissions recorded for your account</CardDescription>
          </div>
          <Link to="/submissions" className="text-xs text-blue-500 font-bold hover:underline">
            View All Submissions →
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center">
              <Spinner size="md" label="Loading submissions…" />
            </div>
          ) : submissions.length === 0 ? (
            <EmptyState
              icon={<Code2 size={24} />}
              title="No submissions yet"
              description="Start solving challenges in the practice arena to populate your profile activity."
              actionLabel="Solve Problems"
              onAction={() => (window.location.href = '/practice')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-theme bg-theme-surface text-xs uppercase font-bold text-theme-muted tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Problem</th>
                    <th className="px-5 py-3">Language</th>
                    <th className="px-5 py-3">Verdict</th>
                    <th className="px-5 py-3">Runtime</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {submissions.slice(0, 8).map((sub, i) => (
                    <tr key={sub.id || i} className="hover:bg-theme-surface/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-theme-main">
                        {sub.problem_title || sub.problem_id || 'Problem'}
                      </td>
                      <td className="px-5 py-3.5 text-theme-muted font-mono text-xs">
                        {sub.language?.toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            sub.status === 'Accepted'
                              ? 'easy'
                              : sub.status === 'Wrong Answer'
                              ? 'hard'
                              : 'upcoming'
                          }
                          size="sm"
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-theme-muted">
                        {sub.execution_time ? `${sub.execution_time} ms` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-theme-muted text-xs">
                        {sub.created_at
                          ? new Date(sub.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
