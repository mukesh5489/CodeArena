import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Play,
  Trash2,
  Edit3,
  X,
  Save,
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
import {
  getContests,
  createContest,
  updateContest,
  deleteContest,
} from '../../services/contestService';

export default function AdminContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(120);
  const [status, setStatus] = useState('PUBLISHED');
  const [startTime, setStartTime] = useState('');

  const loadContests = async () => {
    setLoading(true);
    try {
      const res = await getContests();
      if (res?.data) {
        setContests(res.data);
      }
    } catch (err) {
      console.warn('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const openCreateModal = () => {
    setEditingContest(null);
    setTitle('');
    setDescription('');
    setDuration(120);
    setStatus('PUBLISHED');
    setStartTime(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingContest(c);
    setTitle(c.title || '');
    setDescription(c.description || '');
    setDuration(c.duration || 120);
    setStatus(c.status || 'PUBLISHED');
    setStartTime(c.start_time ? new Date(c.start_time).toISOString().slice(0, 16) : '');
    setModalOpen(true);
  };

  const handleSaveContest = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErrorAlert(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration),
      status,
      start_time: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
    };

    try {
      if (editingContest) {
        await updateContest(editingContest.id, payload);
        setSuccessAlert(`Contest "${title}" updated successfully!`);
      } else {
        await createContest(payload);
        setSuccessAlert(`Contest "${title}" created and scheduled successfully!`);
      }
      setModalOpen(false);
      loadContests();
    } catch (err) {
      setErrorAlert(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteContest = async (id, contestTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${contestTitle}"? This cannot be undone.`)) return;
    try {
      await deleteContest(id);
      setSuccessAlert(`Contest "${contestTitle}" deleted.`);
      loadContests();
    } catch (err) {
      setErrorAlert(err.response?.data?.error || 'Failed to delete contest.');
    }
  };

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
          <h1 className="text-3xl font-extrabold text-white">Contest Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Schedule upcoming competitive programming contests, update details, manage live rounds, or delete events.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus size={15} />}
          onClick={openCreateModal}
        >
          Schedule Contest
        </Button>
      </div>

      {successAlert && (
        <Alert variant="success" title="Success" onClose={() => setSuccessAlert(null)}>
          {successAlert}
        </Alert>
      )}

      {errorAlert && (
        <Alert variant="error" title="Error" onClose={() => setErrorAlert(null)}>
          {errorAlert}
        </Alert>
      )}

      {/* Contests List */}
      {loading ? (
        <div className="py-16 text-center">
          <Spinner size="lg" label="Loading contests…" />
        </div>
      ) : contests.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <Trophy size={36} className="text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">No contests scheduled yet.</p>
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            Schedule Your First Contest
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {contests.map((c) => (
            <Card key={c.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={c.status?.toLowerCase() || 'upcoming'}>
                      {c.status}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock size={13} /> {c.duration} mins
                    </span>
                    {c.start_time && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={13} /> {new Date(c.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-2 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer border border-[#1e2d4a]"
                    title="Edit Contest"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteContest(c.id, c.title)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border border-[#1e2d4a]"
                    title="Delete Contest"
                  >
                    <Trash2 size={15} />
                  </button>
                  <Link to={`/contests/${c.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Link to={`/contests/${c.id}/arena`}>
                    <Button variant="primary" size="sm" icon={<Play size={13} />}>
                      Arena
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule / Edit Contest Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingContest ? `Edit Contest: ${editingContest.title}` : 'Schedule New Contest'}
        description="Configure contest timing, format, and participation rules."
        size="md"
      >
        <form onSubmit={handleSaveContest} className="space-y-4 text-xs">
          <Input
            label="Contest Title *"
            placeholder="e.g. CodeArena Weekly Contest #13"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Contest Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contest format, scoring rules, and problem details..."
              className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1527] p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes) *"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="15"
              max="600"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0d1527] p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="PUBLISHED">Published (Upcoming)</option>
                <option value="LIVE">Live Now</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <Input
            label="Start Date & Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e2d4a]">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<Save size={14} />}>
              {editingContest ? 'Save Changes' : 'Schedule Contest'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
