import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Plus,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Search,
  Check,
  X,
  Lock,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Select,
  Modal,
  Alert,
  Spinner,
} from '../../components/ui';
import { getProblems, createProblem, deleteProblem } from '../../services/problemService';

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState(null);

  // Problem Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [type, setType] = useState('CODING');
  const [topic, setTopic] = useState('Arrays');
  const [points, setPoints] = useState(100);
  const [timeLimit, setTimeLimit] = useState(2000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');

  // Sample Test Case
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');

  // Hidden Test Cases Array
  const [hiddenTestCases, setHiddenTestCases] = useState([
    { input: '', expected_output: '' },
  ]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const res = await getProblems();
      if (res.success && res.data) {
        setProblems(res.data);
      }
    } catch (err) {
      console.warn('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const addHiddenTestCase = () => {
    setHiddenTestCases([...hiddenTestCases, { input: '', expected_output: '' }]);
  };

  const updateHiddenTestCase = (idx, field, val) => {
    const updated = [...hiddenTestCases];
    updated[idx][field] = val;
    setHiddenTestCases(updated);
  };

  const removeHiddenTestCase = (idx) => {
    if (hiddenTestCases.length > 1) {
      setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== idx));
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setAlertMsg({ type: 'error', text: 'Problem title and description are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        type,
        topic,
        points: Number(points),
        time_limit: Number(timeLimit),
        memory_limit: Number(memoryLimit),
        input_format: inputFormat.trim(),
        output_format: outputFormat.trim(),
        constraints: constraints.trim(),
        sample_input: sampleInput.trim(),
        sample_output: sampleOutput.trim(),
        hidden_test_cases: hiddenTestCases.filter(
          (tc) => tc.input.trim() && tc.expected_output.trim()
        ),
      };

      const res = await createProblem(payload);
      if (res.success) {
        setAlertMsg({ type: 'success', text: `Problem "${title}" created with hidden test cases!` });
        setModalOpen(false);
        // Reset form
        setTitle('');
        setDescription('');
        setInputFormat('');
        setOutputFormat('');
        setConstraints('');
        setSampleInput('');
        setSampleOutput('');
        setHiddenTestCases([{ input: '', expected_output: '' }]);
        loadProblems();
      } else {
        setAlertMsg({ type: 'error', text: res.error || 'Failed to create problem' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, probTitle) => {
    if (!window.confirm(`Are you sure you want to delete problem "${probTitle}"?`)) return;
    try {
      await deleteProblem(id);
      setProblems(problems.filter((p) => p.id !== id));
      setAlertMsg({ type: 'success', text: `Problem "${probTitle}" deleted successfully.` });
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2d4a] pb-6">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-400 mb-2 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white">Problem Authoring</h1>
            <Badge variant="purple">Admin Only</Badge>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Author coding challenges, define input/output contracts, and configure hidden test cases for sandboxed evaluation.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus size={15} />}
          onClick={() => setModalOpen(true)}
        >
          Add Problem with Hidden Testcases
        </Button>
      </div>

      {alertMsg && (
        <Alert
          variant={alertMsg.type}
          title={alertMsg.type === 'success' ? 'Success' : 'Notice'}
          onClose={() => setAlertMsg(null)}
        >
          {alertMsg.text}
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search problems by title or topic..."
            icon={<Search size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-400 font-medium font-mono">
          {filtered.length} problems authored
        </span>
      </div>

      {/* Problems Table */}
      {loading ? (
        <div className="py-16 text-center">
          <Spinner size="lg" label="Loading problem repository..." />
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1e2d4a] bg-[#111827] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-[#1e2d4a] bg-[#0d1527] text-xs uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d4a]">
                {filtered.map((prob) => (
                  <tr key={prob.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <Link to={`/practice/${prob.id}`} className="hover:text-blue-400">
                        {prob.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={prob.type === 'MCQ' ? 'purple' : 'default'}>
                        {prob.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={prob.difficulty?.toLowerCase() || 'easy'}>
                        {prob.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {prob.topic}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-amber-400">
                      {prob.points || 100} pts
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Link to={`/practice/${prob.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye size={13} />}>
                          Preview
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        icon={<Trash2 size={13} />}
                        onClick={() => handleDelete(prob.id, prob.title)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Authoring Modal with Hidden Testcases Builder */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Author Problem & Hidden Test Cases"
        description="Configure problem statement, sample cases, and hidden test cases for sandboxed grading."
        size="lg"
      >
        <form onSubmit={handleCreateProblem} className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-2">
          {/* Basic Details */}
          <div className="space-y-3">
            <Input
              label="Problem Title"
              placeholder="e.g. Merge Two Sorted Lists"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={[
                  { value: 'EASY', label: 'Easy' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HARD', label: 'Hard' },
                ]}
              />

              <Select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'CODING', label: 'Coding Challenge' },
                  { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
                ]}
              />

              <Select
                label="Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                options={[
                  { value: 'Arrays', label: 'Arrays' },
                  { value: 'Strings', label: 'Strings' },
                  { value: 'Linked Lists', label: 'Linked Lists' },
                  { value: 'Stack', label: 'Stack' },
                  { value: 'Queue', label: 'Queue' },
                  { value: 'Trees', label: 'Trees' },
                  { value: 'Graphs', label: 'Graphs' },
                  { value: 'Dynamic Programming', label: 'Dynamic Programming' },
                  { value: 'Searching', label: 'Searching' },
                  { value: 'Mathematics', label: 'Mathematics' },
                ]}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Points"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="10"
                max="1000"
              />
              <Input
                label="Time Limit (ms)"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="500"
                max="10000"
              />
              <Input
                label="Memory Limit (MB)"
                type="number"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
                min="64"
                max="1024"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Problem Description (Markdown supported) *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem clearly with all requirements..."
              className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1527] p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Input/Output Formats & Constraints */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Input Format
              </label>
              <textarea
                rows={2}
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                placeholder="First line contains N..."
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1527] p-2.5 font-mono text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Output Format
              </label>
              <textarea
                rows={2}
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                placeholder="Print the result on a single line..."
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1527] p-2.5 font-mono text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Sample Test Case (Public to students) */}
          <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
              <Eye size={13} />
              <span>Sample Test Case (Visible to Students in Workspace)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Sample Input</span>
                <textarea
                  rows={2}
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  placeholder="4 9\n2 7 11 15"
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1527] p-2 font-mono text-xs text-emerald-400"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Sample Expected Output</span>
                <textarea
                  rows={2}
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  placeholder="0 1"
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1527] p-2 font-mono text-xs text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Hidden Test Cases (Private - Evaluated in sandbox) */}
          <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                <Lock size={13} />
                <span>Hidden Test Cases (Strictly Hidden from Students)</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:bg-purple-500/10 text-xs py-1"
                icon={<Plus size={12} />}
                onClick={addHiddenTestCase}
              >
                Add Hidden Case
              </Button>
            </div>

            <div className="space-y-2.5">
              {hiddenTestCases.map((tc, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-[#1e2d4a] bg-[#0d1527] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Hidden Case #{idx + 1}</span>
                    {hiddenTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHiddenTestCase(idx)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <textarea
                      rows={2}
                      value={tc.input}
                      onChange={(e) => updateHiddenTestCase(idx, 'input', e.target.value)}
                      placeholder="Hidden Input..."
                      className="w-full rounded border border-[#1e2d4a] bg-[#111827] p-2 font-mono text-[11px] text-slate-200"
                    />
                    <textarea
                      rows={2}
                      value={tc.expected_output}
                      onChange={(e) => updateHiddenTestCase(idx, 'expected_output', e.target.value)}
                      placeholder="Expected Output..."
                      className="w-full rounded border border-[#1e2d4a] bg-[#111827] p-2 font-mono text-[11px] text-emerald-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e2d4a]">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Problem & Hidden Testcases
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
