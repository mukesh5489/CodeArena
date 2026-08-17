import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Trophy,
  Code2,
  Users,
  Terminal,
  Plus,
  Trash2,
  Edit3,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowRight,
  Bell,
  BookOpen,
  Zap,
  Save,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Alert,
  Spinner,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getProblems, createProblem, deleteProblem } from '../../services/problemService';
import { getContests } from '../../services/contestService';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: <Shield size={14} /> },
  { id: 'problems', label: 'Problems', icon: <Code2 size={14} /> },
  { id: 'users', label: 'Users', icon: <Users size={14} /> },
  { id: 'broadcast', label: 'Broadcast Email', icon: <Mail size={14} /> },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ── Overview stats ──────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ problems: 0, contests: 0, users: 0, submissions: 0 });

  // ── Problems tab ────────────────────────────────────────────────────────────
  const [problems, setProblems] = useState([]);
  const [probLoading, setProbLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [probSuccess, setProbSuccess] = useState(null);
  const [probError, setProbError] = useState(null);
  const [newProb, setNewProb] = useState({
    title: '', description: '', difficulty: 'EASY', type: 'CODING',
    topic: '', points: 100, time_limit: 2000, memory_limit: 256,
    input_format: '', output_format: '', constraints: '',
    sample_input: '', sample_output: '',
    sample_test_cases: [{ input: '', expected_output: '' }],
    hidden_test_cases: [{ input: '', expected_output: '' }],
  });

  // ── Users tab ───────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersError, setUsersError] = useState(null);

  // ── Broadcast tab ────────────────────────────────────────────────────────────
  const [bcSubject, setBcSubject] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcLoading, setBcLoading] = useState(false);
  const [bcResult, setBcResult] = useState(null);

  // ── Load initial data ────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    const [pRes, cRes, uRes, sRes] = await Promise.allSettled([
      getProblems(),
      getContests(),
      api.get('/admin/users'),
      api.get('/submissions'),
    ]);
    setStats({
      problems: pRes.value?.data?.length || 0,
      contests: cRes.value?.data?.length || 0,
      users: uRes.value?.data?.data?.length || 0,
      submissions: sRes.value?.data?.data?.length || 0,
    });
  }, []);

  const loadProblems = useCallback(async () => {
    setProbLoading(true);
    const res = await getProblems();
    if (res?.data) setProblems(res.data);
    setProbLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.data || []);
    } catch (err) {
      setUsersError('Failed to load users.');
    }
    setUsersLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => {
    if (activeTab === 'problems') loadProblems();
    if (activeTab === 'users') loadUsers();
  }, [activeTab, loadProblems, loadUsers]);

  // ── Problem helpers ──────────────────────────────────────────────────────────
  const resetProbForm = () => {
    setNewProb({
      title: '', description: '', difficulty: 'EASY', type: 'CODING',
      topic: '', points: 100, time_limit: 2000, memory_limit: 256,
      input_format: '', output_format: '', constraints: '',
      sample_input: '', sample_output: '',
      sample_test_cases: [{ input: '', expected_output: '' }],
      hidden_test_cases: [{ input: '', expected_output: '' }],
    });
    setEditingProblem(null);
    setShowCreateForm(false);
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    setProbError(null);
    setProbSuccess(null);
    try {
      if (editingProblem) {
        await api.patch(`/problems/${editingProblem.id}`, newProb);
        setProbSuccess(`"${newProb.title}" updated successfully!`);
      } else {
        await createProblem(newProb);
        setProbSuccess(`"${newProb.title}" created successfully!`);
      }
      resetProbForm();
      loadProblems();
      loadStats();
    } catch (err) {
      setProbError(err.response?.data?.error || err.message);
    }
  };

  const handleEditProblem = (p) => {
    setEditingProblem(p);
    setNewProb({
      title: p.title || '', description: p.description || '',
      difficulty: p.difficulty || 'EASY', type: p.type || 'CODING',
      topic: p.topic || '', points: p.points || 100,
      time_limit: p.time_limit || 2000, memory_limit: p.memory_limit || 256,
      input_format: p.input_format || '', output_format: p.output_format || '',
      constraints: p.constraints || '', sample_input: p.sample_input || '',
      sample_output: p.sample_output || '',
      sample_test_cases: [{ input: '', expected_output: '' }],
      hidden_test_cases: [{ input: '', expected_output: '' }],
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProblem = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deleteProblem(id);
    setProbSuccess(`"${title}" deleted.`);
    loadProblems();
    loadStats();
  };

  // Test case helpers
  const addTestCase = (field) =>
    setNewProb((p) => ({ ...p, [field]: [...p[field], { input: '', expected_output: '' }] }));
  const removeTestCase = (field, idx) =>
    setNewProb((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));
  const updateTestCase = (field, idx, key, val) =>
    setNewProb((p) => ({
      ...p,
      [field]: p[field].map((tc, i) => (i === idx ? { ...tc, [key]: val } : tc)),
    }));

  // ── Delete user ───────────────────────────────────────────────────────────────
  const handleDeleteUser = async (id, name, email) => {
    if (email === 'admin2026@gmail.com') { setUsersError('Cannot delete the admin account.'); return; }
    if (!window.confirm(`Delete user "${name}" (${email})? All their submissions will be removed.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers();
      loadStats();
    } catch (err) {
      setUsersError(err.response?.data?.error || 'Delete failed.');
    }
  };

  // ── Broadcast ─────────────────────────────────────────────────────────────────
  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBcLoading(true);
    setBcResult(null);
    try {
      const res = await api.post('/admin/broadcast', { subject: bcSubject, message: bcMessage });
      setBcResult({ type: 'success', msg: res.data.message, count: res.data.sent });
      setBcSubject('');
      setBcMessage('');
    } catch (err) {
      setBcResult({ type: 'error', msg: err.response?.data?.error || 'Failed to send.' });
    }
    setBcLoading(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const diffColor = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2d4a] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" icon={<Shield size={12} />}>Admin Portal</Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Platform Administration</h1>
          <p className="text-slate-400 text-sm mt-1">
            Logged in as <span className="text-purple-400 font-semibold">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/contests">
            <Button variant="outline" size="md" icon={<Trophy size={15} />}>Manage Contests</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-[#111827] rounded-xl border border-[#1e2d4a]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Problems', value: stats.problems, icon: <Code2 size={20} className="text-blue-400" />, color: 'text-blue-400' },
              { label: 'Contests', value: stats.contests, icon: <Trophy size={20} className="text-amber-400" />, color: 'text-amber-400' },
              { label: 'Registered Users', value: stats.users, icon: <Users size={20} className="text-emerald-400" />, color: 'text-emerald-400' },
              { label: 'Total Submissions', value: stats.submissions, icon: <Terminal size={20} className="text-purple-400" />, color: 'text-purple-400' },
            ].map((s) => (
              <Card key={s.label} className="p-5">
                <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                <div className="text-3xl font-black text-white mt-1.5 flex items-center justify-between">
                  <span className={s.color}>{s.value}</span>
                  {s.icon}
                </div>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { tab: 'problems', title: 'Manage Problems', desc: 'Add, edit, delete coding and quiz questions. Configure hidden test cases.', icon: <Code2 size={20} />, color: 'blue', action: 'Open Problems' },
              { tab: 'users', title: 'Manage Users', desc: 'View all registered students, remove accounts, see activity.', icon: <Users size={20} />, color: 'emerald', action: 'View Users' },
              { tab: 'broadcast', title: 'Broadcast Email', desc: 'Send announcements or notifications to all registered users at once.', icon: <Mail size={20} />, color: 'purple', action: 'Send Email' },
            ].map((c) => (
              <Card key={c.tab} hover className="space-y-3 cursor-pointer" onClick={() => setActiveTab(c.tab)}>
                <CardHeader>
                  <div className={`h-10 w-10 rounded-xl bg-${c.color}-500/10 border border-${c.color}-500/30 flex items-center justify-center text-${c.color}-400`}>
                    {c.icon}
                  </div>
                  <CardTitle className="text-lg mt-3">{c.title}</CardTitle>
                  <CardDescription>{c.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
                    {c.action}
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Card hover className="space-y-3 cursor-pointer" onClick={() => navigate('/admin/contests')}>
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy size={20} />
                </div>
                <CardTitle className="text-lg mt-3">Manage Contests</CardTitle>
                <CardDescription>Schedule contests, set timers, assign problems to contest rounds.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                  Open Contests
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── PROBLEMS TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {probSuccess && <Alert variant="success" onClose={() => setProbSuccess(null)}>{probSuccess}</Alert>}
          {probError && <Alert variant="error" onClose={() => setProbError(null)}>{probError}</Alert>}

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{problems.length} Problems</h2>
            <Button
              variant="primary"
              size="sm"
              icon={showCreateForm ? <X size={14} /> : <Plus size={14} />}
              onClick={() => { resetProbForm(); setShowCreateForm(!showCreateForm); }}
            >
              {showCreateForm ? 'Cancel' : 'Add Problem'}
            </Button>
          </div>

          {/* Create / Edit Form */}
          {showCreateForm && (
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-[#111827] to-[#0d1527] p-6 shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 size={16} className="text-blue-400" />
                {editingProblem ? `Editing: "${editingProblem.title}"` : 'Create New Problem'}
              </h3>

              <form onSubmit={handleSubmitProblem} className="space-y-5">
                {/* Row 1 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Problem Title *" placeholder="e.g. Two Sum" value={newProb.title}
                    onChange={(e) => setNewProb((p) => ({ ...p, title: e.target.value }))} required />
                  <Input label="Topic / Category *" placeholder="e.g. Arrays, Graphs" value={newProb.topic}
                    onChange={(e) => setNewProb((p) => ({ ...p, topic: e.target.value }))} required />
                </div>

                {/* Row 2: selects */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty *</label>
                    <select value={newProb.difficulty}
                      onChange={(e) => setNewProb((p) => ({ ...p, difficulty: e.target.value }))}
                      className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-sm px-3 py-2.5 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="EASY">🟢 Easy</option>
                      <option value="MEDIUM">🟡 Medium</option>
                      <option value="HARD">🔴 Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Type *</label>
                    <select value={newProb.type}
                      onChange={(e) => setNewProb((p) => ({ ...p, type: e.target.value }))}
                      className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-sm px-3 py-2.5 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="CODING">💻 Coding</option>
                      <option value="MCQ">📝 Quiz (MCQ)</option>
                    </select>
                  </div>
                  <Input label="Points" type="number" value={newProb.points}
                    onChange={(e) => setNewProb((p) => ({ ...p, points: e.target.value }))} />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problem Description *</label>
                  <textarea rows={4} value={newProb.description}
                    onChange={(e) => setNewProb((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the problem statement clearly…"
                    className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-sm px-3 py-2.5 focus:border-blue-500 outline-none resize-y font-mono"
                    required
                  />
                </div>

                {/* I/O format */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Input Format</label>
                    <textarea rows={2} value={newProb.input_format}
                      onChange={(e) => setNewProb((p) => ({ ...p, input_format: e.target.value }))}
                      placeholder="Describe input format…"
                      className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-sm px-3 py-2.5 focus:border-blue-500 outline-none resize-y font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Output Format</label>
                    <textarea rows={2} value={newProb.output_format}
                      onChange={(e) => setNewProb((p) => ({ ...p, output_format: e.target.value }))}
                      placeholder="Describe expected output…"
                      className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-sm px-3 py-2.5 focus:border-blue-500 outline-none resize-y font-mono"
                    />
                  </div>
                </div>

                {/* Constraints + Sample */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Constraints</label>
                    <textarea rows={2} value={newProb.constraints}
                      onChange={(e) => setNewProb((p) => ({ ...p, constraints: e.target.value }))}
                      placeholder="1 ≤ n ≤ 10^5…"
                      className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-sm px-3 py-2.5 focus:border-blue-500 outline-none resize-y font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sample Input</label>
                      <textarea rows={2} value={newProb.sample_input}
                        onChange={(e) => setNewProb((p) => ({ ...p, sample_input: e.target.value }))}
                        className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-xs px-2 py-2 font-mono focus:border-blue-500 outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sample Output</label>
                      <textarea rows={2} value={newProb.sample_output}
                        onChange={(e) => setNewProb((p) => ({ ...p, sample_output: e.target.value }))}
                        className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-xs px-2 py-2 font-mono focus:border-blue-500 outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Cases (only for CODING) */}
                {newProb.type === 'CODING' && (
                  <>
                    {/* Visible Sample Test Cases */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Eye size={13} /> Visible Sample Test Cases
                        </label>
                        <Button type="button" variant="ghost" size="sm" icon={<Plus size={12} />}
                          onClick={() => addTestCase('sample_test_cases')}>Add</Button>
                      </div>
                      {newProb.sample_test_cases.map((tc, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono">INPUT</label>
                            <textarea value={tc.input} rows={2}
                              onChange={(e) => updateTestCase('sample_test_cases', i, 'input', e.target.value)}
                              className="w-full mt-1 rounded-lg bg-[#0d1527] border border-[#1e2d4a] text-white text-xs px-2 py-1.5 font-mono outline-none focus:border-blue-500 resize-y"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono">EXPECTED OUTPUT</label>
                            <textarea value={tc.expected_output} rows={2}
                              onChange={(e) => updateTestCase('sample_test_cases', i, 'expected_output', e.target.value)}
                              className="w-full mt-1 rounded-lg bg-[#0d1527] border border-[#1e2d4a] text-white text-xs px-2 py-1.5 font-mono outline-none focus:border-blue-500 resize-y"
                            />
                          </div>
                          {newProb.sample_test_cases.length > 1 && (
                            <button type="button" onClick={() => removeTestCase('sample_test_cases', i)}
                              className="col-span-2 text-xs text-rose-400 hover:underline cursor-pointer text-left">
                              Remove test case #{i + 1}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Hidden Test Cases */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          🔒 Hidden Test Cases (Students cannot see these)
                        </label>
                        <Button type="button" variant="ghost" size="sm" icon={<Plus size={12} />}
                          onClick={() => addTestCase('hidden_test_cases')}>Add</Button>
                      </div>
                      {newProb.hidden_test_cases.map((tc, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono">INPUT</label>
                            <textarea value={tc.input} rows={2}
                              onChange={(e) => updateTestCase('hidden_test_cases', i, 'input', e.target.value)}
                              className="w-full mt-1 rounded-lg bg-[#0d1527] border border-[#1e2d4a] text-white text-xs px-2 py-1.5 font-mono outline-none focus:border-blue-500 resize-y"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono">EXPECTED OUTPUT</label>
                            <textarea value={tc.expected_output} rows={2}
                              onChange={(e) => updateTestCase('hidden_test_cases', i, 'expected_output', e.target.value)}
                              className="w-full mt-1 rounded-lg bg-[#0d1527] border border-[#1e2d4a] text-white text-xs px-2 py-1.5 font-mono outline-none focus:border-blue-500 resize-y"
                            />
                          </div>
                          {newProb.hidden_test_cases.length > 1 && (
                            <button type="button" onClick={() => removeTestCase('hidden_test_cases', i)}
                              className="col-span-2 text-xs text-rose-400 hover:underline cursor-pointer text-left">
                              Remove hidden case #{i + 1}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2 border-t border-[#1e2d4a]">
                  <Button variant="primary" type="submit" icon={<Save size={15} />}>
                    {editingProblem ? 'Save Changes' : 'Create Problem'}
                  </Button>
                  <Button variant="ghost" type="button" onClick={resetProbForm} icon={<X size={15} />}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Problems Table */}
          {probLoading ? (
            <div className="py-16 text-center"><Spinner size="lg" label="Loading problems…" /></div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-[#1e2d4a] bg-[#0d1527] text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Title</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Difficulty</th>
                        <th className="px-5 py-3">Topic</th>
                        <th className="px-5 py-3">Points</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d4a]">
                      {problems.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-500 text-xs">No problems yet. Click "Add Problem" to create the first one.</td></tr>
                      ) : problems.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3 font-bold text-white">{p.title}</td>
                          <td className="px-5 py-3">
                            <Badge variant={p.type === 'MCQ' ? 'purple' : 'blue'}>
                              {p.type === 'MCQ' ? '📝 Quiz' : '💻 Coding'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={diffColor[p.difficulty] || 'default'}>{p.difficulty}</Badge>
                          </td>
                          <td className="px-5 py-3 text-slate-400 text-xs">{p.topic}</td>
                          <td className="px-5 py-3 font-mono text-amber-400">{p.points}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => handleEditProblem(p)}
                                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer" title="Edit">
                                <Edit3 size={14} />
                              </button>
                              <Link to={`/practice/${p.id}`} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors" title="Preview">
                                <Eye size={14} />
                              </Link>
                              <button onClick={() => handleDeleteProblem(p.id, p.title)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── USERS TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{users.length} Registered Users</h2>
            <div className="flex items-center gap-3">
              <div className="w-64">
                <Input placeholder="Search name or email…" icon={<Search size={14} />}
                  value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} />
              </div>
              <button onClick={loadUsers}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {usersError && <Alert variant="error" onClose={() => setUsersError(null)}>{usersError}</Alert>}

          {usersLoading ? (
            <div className="py-16 text-center"><Spinner size="lg" label="Loading users…" /></div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-[#1e2d4a] bg-[#0d1527] text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Joined</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d4a]">
                      {users
                        .filter((u) =>
                          u.name?.toLowerCase().includes(usersSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(usersSearch.toLowerCase())
                        )
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.name} className="h-8 w-8 rounded-lg border border-[#1e2d4a]" />
                                ) : (
                                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-[10px] font-bold">{u.name?.slice(0, 2).toUpperCase()}</span>
                                  </div>
                                )}
                                <span className="font-bold text-white text-xs">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-slate-400 text-xs font-mono">{u.email}</td>
                            <td className="px-5 py-3">
                              <Badge variant={u.role === 'ADMIN' ? 'purple' : 'default'}>
                                {u.role === 'ADMIN' ? '🛡️ Admin' : '👤 Student'}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-slate-500 text-xs">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                            </td>
                            <td className="px-5 py-3 text-right">
                              {u.email !== 'admin2026@gmail.com' && (
                                <button onClick={() => handleDeleteUser(u.id, u.name, u.email)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Delete user">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      {users.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-10 text-slate-500 text-xs">No users registered yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── BROADCAST TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'broadcast' && (
        <div className="max-w-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail size={18} className="text-purple-400" /> Broadcast Email
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              This will send an email + in-app notification to <strong className="text-white">all registered students</strong>.
            </p>
          </div>

          {bcResult && (
            <Alert
              variant={bcResult.type === 'success' ? 'success' : 'error'}
              onClose={() => setBcResult(null)}
            >
              {bcResult.msg}
              {bcResult.count > 0 && ` (${bcResult.count} users notified)`}
            </Alert>
          )}

          <Card>
            <CardContent className="pt-6 space-y-5">
              <form onSubmit={handleBroadcast} className="space-y-4">
                <Input
                  label="Subject Line *"
                  placeholder="e.g. New Contest This Sunday! 🏆"
                  value={bcSubject}
                  onChange={(e) => setBcSubject(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    rows={7}
                    value={bcMessage}
                    onChange={(e) => setBcMessage(e.target.value)}
                    placeholder="Write your announcement here. This will appear in email and as an in-app notification…"
                    className="w-full rounded-xl bg-[#0d1527] border border-[#1e2d4a] text-white text-sm px-3 py-2.5 focus:border-purple-500 outline-none resize-y transition-colors"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {bcMessage.length} characters
                  </p>
                </div>

                {/* Preview Box */}
                {bcMessage && (
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-1">
                    <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Preview</p>
                    <p className="text-xs font-bold text-white">{bcSubject || '(No subject)'}</p>
                    <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{bcMessage}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-[#1e2d4a]">
                  <Button
                    variant="primary"
                    type="submit"
                    loading={bcLoading}
                    icon={<Send size={15} />}
                  >
                    Send to All Users
                  </Button>
                  <p className="text-xs text-slate-500">
                    Will be sent to all registered students as email + in-app notification.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
