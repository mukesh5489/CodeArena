import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Code2,
  CheckCircle2,
  Play,
  Layers,
  Filter,
  Sparkles,
  BookOpen,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Button, Badge, Card, Input, Select, Spinner, EmptyState } from '../components/ui';
import { getProblems } from '../services/problemService';

export default function PracticePage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [type, setType] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProblems();
        if (res?.data) {
          setProblems(res.data);
        }
      } catch (err) {
        console.warn('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topics = useMemo(() => {
    const set = new Set(problems.map((p) => p.topic).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [problems]);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchSearch =
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.topic?.toLowerCase().includes(search.toLowerCase());
      const matchDiff = difficulty === 'ALL' || (p.difficulty || '').toUpperCase() === difficulty;
      const matchTopic = topic === 'ALL' || p.topic === topic;
      const matchType = type === 'ALL' || (p.type || 'CODING').toUpperCase() === type;
      return matchSearch && matchDiff && matchTopic && matchType;
    });
  }, [problems, search, difficulty, topic, type]);

  const diffColor = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-fade-in">
      {/* Header Banner with generous spacing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-theme pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500">
              <Code2 size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight">
              Problem Archive
            </h1>
          </div>
          <p className="text-sm text-theme-sub max-w-xl">
            Browse through curated algorithmic challenges and quizzes across arrays, dynamic programming, strings, and trees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="blue" size="md">
            {filtered.length} Challenges Available
          </Badge>
        </div>
      </div>

      {/* Filter Row with clean spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <Input
            placeholder="Search problems by title or algorithm…"
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lg:col-span-3">
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Difficulties' },
              { value: 'EASY', label: '🟢 Easy' },
              { value: 'MEDIUM', label: '🟡 Medium' },
              { value: 'HARD', label: '🔴 Hard' },
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <Select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            options={topics.map((t) => ({ value: t, label: t === 'ALL' ? 'All Topics' : t }))}
          />
        </div>

        <div className="lg:col-span-2">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'CODING', label: '💻 Coding' },
              { value: 'MCQ', label: '📝 Quiz' },
            ]}
          />
        </div>
      </div>

      {/* Problems Table & Cards */}
      {loading ? (
        <div className="py-24 text-center">
          <Spinner size="lg" label="Loading challenges…" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Code2 size={32} />}
          title="No problems match your criteria"
          description="Try modifying your search keywords or resetting the topic filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setDifficulty('ALL');
            setTopic('ALL');
            setType('ALL');
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden shadow-lg border-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-theme bg-theme-surface text-xs uppercase font-extrabold text-theme-muted tracking-wider">
                <tr>
                  <th className="px-8 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filtered.map((p, idx) => (
                  <tr
                    key={p.id || idx}
                    className="hover:bg-theme-surface/70 transition-all duration-200 group"
                  >
                    <td className="px-8 py-5">
                      <Link
                        to={`/practice/${p.id}`}
                        className="font-bold text-theme-main text-sm sm:text-base group-hover:text-blue-500 transition-colors block"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={diffColor[p.difficulty] || 'easy'}>
                        {p.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-xs font-semibold text-theme-muted">
                      {p.topic || 'General'}
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={p.type === 'MCQ' ? 'purple' : 'blue'} size="sm">
                        {p.type === 'MCQ' ? 'Quiz' : 'Coding'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 font-mono text-amber-500 font-bold text-xs">
                      {p.points || 100} pts
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link to={`/practice/${p.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Play size={13} />}
                          className="shadow-sm group-hover:shadow-blue-500/20"
                        >
                          Solve
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
