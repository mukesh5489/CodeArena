import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  BookOpen,
  Bug,
  MessageSquare,
  Send,
  X,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Bot,
  User,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Button, Badge, Card, Spinner } from '../ui';
import {
  getAiHint,
  getAiApproach,
  reviewAiCode,
  sendAiChat,
} from '../../services/aiService';

export default function AiAssistantModal({
  isOpen,
  onClose,
  problem,
  userCode,
  language = 'python',
}) {
  const [tab, setTab] = useState('hint'); // 'hint' | 'explain' | 'review' | 'chat'
  const [hintLevel, setHintLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your Gemini AI Coding Assistant on CodeArena. 🚀\n\nI can provide subtle algorithmic hints, explain optimal time complexities, review your code for bugs, or answer any questions about "${problem?.title || 'this challenge'}". How can I help you?`,
    },
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (tab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, tab]);

  if (!isOpen) return null;

  const handleGetHint = async (level) => {
    setLoading(true);
    setError(null);
    setHintLevel(level);
    try {
      const res = await getAiHint({
        problemTitle: problem?.title || 'Coding Challenge',
        problemDescription: problem?.description || '',
        userCode,
        language,
        hintLevel: level,
      });
      if (res.success && res.data?.hint) {
        setResult(res.data.hint);
      } else {
        setError(res.error || 'Failed to generate hint.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAiApproach({
        problemTitle: problem?.title || 'Coding Challenge',
        problemDescription: problem?.description || '',
        difficulty: problem?.difficulty || 'Medium',
        topic: problem?.topic || 'Algorithms',
      });
      if (res.success && res.data?.explanation) {
        setResult(res.data.explanation);
      } else {
        setError(res.error || 'Failed to generate explanation.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewAiCode({
        problemTitle: problem?.title || 'Coding Challenge',
        problemDescription: problem?.description || '',
        userCode,
        language,
      });
      if (res.success && res.data?.review) {
        setResult(res.data.review);
      } else {
        setError(res.error || 'Failed to review code.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newHistory);
    setLoading(true);

    try {
      const res = await sendAiChat({
        message: userMsg,
        problemTitle: problem?.title || '',
        problemDescription: problem?.description || '',
        userCode,
        language,
        chatHistory: newHistory,
      });

      if (res.success && res.data?.reply) {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.reply },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I could not process that query. Please try again!' },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'AI service unavailable'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-theme-card border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles size={18} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-theme-main text-base sm:text-lg">
                  Gemini AI Mentor
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Google AI
                </span>
              </div>
              <p className="text-[11px] text-theme-muted truncate max-w-sm sm:max-w-md">
                Analyzing: {problem?.title || 'Current Code'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-theme-surface border-b border-theme overflow-x-auto">
          {[
            { id: 'hint', label: 'Smart Hints', icon: <Lightbulb size={14} /> },
            { id: 'explain', label: 'Approach & Big-O', icon: <BookOpen size={14} /> },
            { id: 'review', label: 'Code Review & Bug Fix', icon: <Bug size={14} /> },
            { id: 'chat', label: 'AI Mentor Chat', icon: <MessageSquare size={14} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setResult(null);
                setError(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-theme-muted hover:text-theme-main hover:bg-theme-card'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* TAB 1: Progressive Hints */}
          {tab === 'hint' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                <span className="font-bold text-theme-main flex items-center gap-1.5 text-xs">
                  <Zap size={14} className="text-amber-500" /> Progressive Hint System
                </span>
                <p className="text-[11px] text-theme-sub leading-relaxed">
                  Choose a level to get tailored guidance without spoiling the solution.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { lvl: 1, title: 'Level 1: Nudge', sub: 'Intuition & Edge case' },
                    { lvl: 2, title: 'Level 2: Strategy', sub: 'Optimal Data Structure' },
                    { lvl: 3, title: 'Level 3: Algorithm', sub: 'Step-by-step Logic' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => handleGetHint(item.lvl)}
                      disabled={loading}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        hintLevel === item.lvl && result
                          ? 'border-blue-500 bg-blue-500/15'
                          : 'border-theme hover:border-blue-500/40 bg-theme-surface'
                      }`}
                    >
                      <span className="font-black text-theme-main block text-xs">{item.title}</span>
                      <span className="text-[10px] text-theme-muted block">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="py-12 text-center">
                  <Spinner size="md" label="Consulting Gemini AI model…" />
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {result && !loading && (
                <div className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-3 animate-fade-in relative group">
                  <div className="flex items-center justify-between pb-2 border-b border-theme">
                    <span className="font-black text-xs text-blue-400 uppercase tracking-wider">
                      Hint Level {hintLevel} Output
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result)}
                      className="p-1 rounded-md text-theme-muted hover:text-theme-main transition-colors"
                      title="Copy hint"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-theme-main leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {result}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Approach & Big-O */}
          {tab === 'explain' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-surface border border-theme">
                <div>
                  <h4 className="font-bold text-theme-main text-xs sm:text-sm">
                    Generate Comprehensive Solution Architecture
                  </h4>
                  <p className="text-[11px] text-theme-muted">
                    Learn the core intuition, optimal Big-O complexity, and pattern recognition.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={loading}
                  onClick={handleGetExplanation}
                  icon={<Sparkles size={14} />}
                >
                  Explain
                </Button>
              </div>

              {loading && (
                <div className="py-12 text-center">
                  <Spinner size="md" label="Analyzing algorithm & complexity with Gemini…" />
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {result && !loading && (
                <div className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-theme">
                    <span className="font-black text-xs text-indigo-400 uppercase tracking-wider">
                      Algorithmic Deep Dive
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result)}
                      className="p-1 rounded-md text-theme-muted hover:text-theme-main transition-colors"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-theme-main leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {result}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Code Review & Bug Fix */}
          {tab === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-surface border border-theme">
                <div>
                  <h4 className="font-bold text-theme-main text-xs sm:text-sm">
                    Review Code for Bugs & Edge Cases
                  </h4>
                  <p className="text-[11px] text-theme-muted">
                    Scans your editor code to spot logical errors, infinite loops, and optimizations.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={loading}
                  onClick={handleReviewCode}
                  icon={<Bug size={14} />}
                >
                  Analyze Code
                </Button>
              </div>

              {loading && (
                <div className="py-12 text-center">
                  <Spinner size="md" label="Debugging your code with Gemini AI…" />
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {result && !loading && (
                <div className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-theme">
                    <span className="font-black text-xs text-rose-400 uppercase tracking-wider">
                      AI Code Review Verdict
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result)}
                      className="p-1 rounded-md text-theme-muted hover:text-theme-main transition-colors"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-theme-main leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {result}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Interactive Mentor Chat */}
          {tab === 'chat' && (
            <div className="flex flex-col h-[50vh] space-y-3">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                      }`}
                    >
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-theme-surface border border-theme text-theme-main rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-theme-muted text-xs p-2">
                    <Spinner size="sm" />
                    <span>Gemini is thinking…</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-theme">
                <input
                  type="text"
                  placeholder="Ask anything (e.g. How to optimize this to O(N)?)"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-theme bg-theme-surface text-theme-main placeholder-theme-muted text-xs focus:outline-none focus:border-blue-500"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!chatInput.trim() || loading}
                  icon={<Send size={14} />}
                >
                  Send
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-theme bg-theme-surface flex items-center justify-between text-[11px] text-theme-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Powered by Google Gemini 3.6 Flash</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-theme-sub hover:text-theme-main font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
