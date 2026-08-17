import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Users,
  Code2,
  TrendingUp,
  Flame,
  Sparkles,
} from 'lucide-react';
import { Badge, Input, Card, Spinner, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/leaderboard');
        if (res?.data?.data) {
          setLeaderboard(res.data.data);
        }
      } catch (_) {
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = leaderboard.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-theme-muted font-mono text-sm font-bold">#{rank}</span>;
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-theme pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Trophy size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight">
              Global Leaderboard
            </h1>
          </div>
          <p className="text-sm text-theme-sub max-w-xl">
            Rankings computed from verified accepted problem submissions and contest scores.
          </p>
        </div>
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by coder name or email…"
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Top 3 Podium Highlights with generous gap */}
      {!loading && top3.length > 0 && !search && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {top3.map((coder, idx) => {
            const ranks = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
            const colors = [
              'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10',
              'border-slate-400/40 bg-slate-400/5 shadow-slate-400/10',
              'border-amber-700/40 bg-amber-700/5 shadow-amber-700/10',
            ];
            return (
              <Card key={coder.id || idx} className={`p-8 text-center space-y-4 shadow-lg ${colors[idx]}`}>
                <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block">
                  {ranks[idx]}
                </span>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-md">
                  <span className="text-white font-black text-xl">
                    {coder.name?.slice(0, 2).toUpperCase() || '??'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-lg text-theme-main">{coder.name}</h3>
                  <p className="text-xs text-theme-muted font-mono">{coder.email}</p>
                </div>
                <div className="pt-4 border-t border-theme flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-theme-muted block text-[11px]">SOLVED</span>
                    <strong className="text-emerald-500 text-sm">{coder.solved_count ?? 0} Qs</strong>
                  </div>
                  <div>
                    <span className="text-theme-muted block text-[11px]">RATING</span>
                    <strong className="text-blue-500 text-sm">
                      {coder.rating || (coder.solved_count ? coder.solved_count * 100 : 1500)}
                    </strong>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      {loading ? (
        <div className="py-24 text-center">
          <Spinner size="lg" label="Loading global rankings…" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No coders found"
          description="Start solving problems to rank on the CodeArena leaderboard."
        />
      ) : (
        <Card className="p-0 overflow-hidden shadow-lg border-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-theme bg-theme-surface text-xs uppercase font-extrabold text-theme-muted tracking-wider">
                <tr>
                  <th className="px-8 py-4">Rank</th>
                  <th className="px-6 py-4">Coder</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Problems Solved</th>
                  <th className="px-8 py-4 text-right">Rating Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filtered.map((entry, idx) => {
                  const isMe = entry.id === user?.id || entry.email === user?.email;
                  return (
                    <tr
                      key={entry.id || idx}
                      className={`transition-all duration-200 ${
                        isMe
                          ? 'bg-blue-500/10 border-l-4 border-blue-500 font-semibold'
                          : 'hover:bg-theme-surface/70'
                      }`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center">{getRankBadge(idx + 1)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3.5">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={entry.name}
                              className="h-9 w-9 rounded-xl border border-theme bg-theme-surface flex-shrink-0 object-cover"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white text-xs font-bold">
                                {entry.name?.slice(0, 2).toUpperCase() || '??'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-theme-main text-sm">
                                {entry.name}
                              </span>
                              {isMe && <Badge variant="blue" size="sm">You</Badge>}
                            </div>
                            <span className="text-xs text-theme-muted font-mono">
                              {entry.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant={entry.role === 'ADMIN' ? 'purple' : 'default'} size="sm">
                          {entry.role === 'ADMIN' ? 'Admin' : 'Student'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 font-mono font-bold text-emerald-500 text-sm">
                        {entry.solved_count ?? 0}
                      </td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-blue-500 text-sm">
                        {entry.rating || (entry.solved_count ? entry.solved_count * 100 : 1500)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
