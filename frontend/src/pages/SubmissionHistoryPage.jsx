import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Terminal,
  Search,
  Eye,
  Filter,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { Button, Badge, Card, Input, Select, Modal, Spinner, EmptyState } from '../components/ui';
import api from '../services/api';

export default function SubmissionHistoryPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/submissions/my');
        if (res?.data?.data) {
          setSubmissions(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchSearch =
      !search ||
      (s.problem_title || s.problem_id || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status) => {
    if (status === 'Accepted') return <Badge variant="easy">ACCEPTED</Badge>;
    if (status === 'Wrong Answer') return <Badge variant="hard">WRONG ANSWER</Badge>;
    if (status === 'Time Limit Exceeded') return <Badge variant="medium">TLE</Badge>;
    return <Badge variant="hard">{status || 'ERROR'}</Badge>;
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-theme pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500">
              <Clock size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight">
              Submission History
            </h1>
          </div>
          <p className="text-sm text-theme-sub max-w-xl">
            Review your past code execution results, memory profiles, execution runtimes, and verdicts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="blue" size="md">
            {submissions.length} Total Attempts
          </Badge>
        </div>
      </div>

      {/* Filter Row with generous spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <Input
            placeholder="Search submissions by problem name…"
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:col-span-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Accepted', label: '✅ Accepted' },
              { value: 'Wrong Answer', label: '❌ Wrong Answer' },
              { value: 'Time Limit Exceeded', label: '⏱️ Time Limit Exceeded' },
              { value: 'Compilation Error', label: '⚠️ Compilation Error' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-24 text-center">
          <Spinner size="lg" label="Loading submission logs…" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Clock size={32} />}
          title="No submissions recorded"
          description="Solve problems in the practice arena or compete in contests to populate your submission history."
          actionLabel="Go to Practice Arena"
          onAction={() => (window.location.href = '/practice')}
        />
      ) : (
        <Card className="p-0 overflow-hidden shadow-lg border-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-theme bg-theme-surface text-xs uppercase font-extrabold text-theme-muted tracking-wider">
                <tr>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Runtime</th>
                  <th className="px-6 py-4">Memory</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-8 py-4 text-right">Source Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filtered.map((s, idx) => (
                  <tr
                    key={s.id || idx}
                    className="hover:bg-theme-surface/70 transition-all duration-200"
                  >
                    <td className="px-8 py-5">{getStatusBadge(s.status)}</td>
                    <td className="px-6 py-5">
                      <Link
                        to={`/practice/${s.problem_id}`}
                        className="font-bold text-theme-main text-sm hover:text-blue-500 transition-colors block"
                      >
                        {s.problem_title || s.problem_id || 'Problem'}
                      </Link>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-theme-muted font-bold">
                      {s.language?.toUpperCase()}
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-theme-main font-semibold">
                      {s.execution_time ? `${s.execution_time} ms` : '—'}
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-theme-muted">
                      {s.memory_used ? `${(s.memory_used / 1024).toFixed(1)} MB` : '—'}
                    </td>
                    <td className="px-6 py-5 text-xs text-theme-muted">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {s.source_code ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(s)}
                          className="p-2 rounded-xl border border-theme bg-theme-surface text-theme-muted hover:text-blue-500 hover:border-blue-500/40 transition-colors cursor-pointer"
                          title="View Source Code"
                        >
                          <Eye size={15} />
                        </button>
                      ) : (
                        <span className="text-theme-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Code Viewer Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={Boolean(selectedSubmission)}
          onClose={() => setSelectedSubmission(null)}
          title={`Solution Code — ${selectedSubmission.problem_title || selectedSubmission.problem_id}`}
          description={`Language: ${selectedSubmission.language?.toUpperCase()} • Verdict: ${selectedSubmission.status}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => copyCode(selectedSubmission.source_code)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-theme bg-theme-surface text-xs font-semibold text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-5 rounded-2xl bg-[#0B101E] text-slate-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-theme">
              {selectedSubmission.source_code}
            </pre>
            <div className="flex justify-end pt-2 border-t border-theme">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSubmission(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
