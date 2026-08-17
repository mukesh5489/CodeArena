import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Code2,
  Zap,
  Users,
  Target,
  Clock,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Shield,
  TrendingUp,
  Play,
  Sparkles,
} from 'lucide-react';
import { Button, Badge, Card, Spinner } from '../components/ui';
import api from '../services/api';

export default function HomePage() {
  const [activeLang, setActiveLang] = useState('python');
  const [stats, setStats] = useState({
    users: 0,
    problems: 0,
    contests: 0,
    submissions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        if (res?.data?.data) {
          setStats(res.data.data);
        }
      } catch (_) {}
      setLoadingStats(false);
    };
    fetchStats();
  }, []);

  const statItems = [
    {
      label: 'Registered Coders',
      value: stats.users > 0 ? stats.users.toLocaleString() : '0',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Curated Challenges',
      value: stats.problems > 0 ? stats.problems.toLocaleString() : '0',
      icon: Code2,
      color: 'text-purple-500',
    },
    {
      label: 'Contests Held',
      value: stats.contests > 0 ? stats.contests.toLocaleString() : '0',
      icon: Trophy,
      color: 'text-amber-500',
    },
    {
      label: 'Solutions Evaluated',
      value: stats.submissions > 0 ? stats.submissions.toLocaleString() : '0',
      icon: Zap,
      color: 'text-emerald-500',
    },
  ];

  const codeSnippets = {
    python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Output: [0, 1] (Time: 24ms, O(N))`,
    cpp: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.count(diff)) return {seen[diff], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (seen.containsKey(diff)) return new int[]{seen.get(diff), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
  };

  const features = [
    {
      icon: <Terminal size={24} className="text-blue-500" />,
      title: 'Professional Monaco Sandbox',
      description:
        'Write, compile, and debug solutions in Python 3, C++ (GCC), and Java (OpenJDK) with full line numbers, auto-complete, and syntax checking.',
    },
    {
      icon: <Zap size={24} className="text-emerald-500" />,
      title: 'Real-time Output Verification',
      description:
        'Verify standard outputs against visible examples and secret hidden test cases with strict CPU time and memory analytics.',
    },
    {
      icon: <Trophy size={24} className="text-amber-500" />,
      title: 'Competitive Contest Arena',
      description:
        'Compete in timed coding sprint rounds, solve algorithmic challenges against live clocks, and climb the global ranking leaderboard.',
    },
    {
      icon: <TrendingUp size={24} className="text-purple-500" />,
      title: 'Rating & Analytics',
      description:
        'Benchmark your problem solving proficiency across arrays, trees, dynamic programming, graphs, and core data structures.',
    },
  ];

  return (
    <div className="space-y-24 py-12 animate-fade-in">
      {/* ── 1. Hero Section (Clean Two-Column, Generous Spacing) ───────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline, Subtitle, Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold w-fit mb-6 shadow-sm">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Competitive Programming & Algorithmic Arena</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-main leading-[1.15] mb-6">
              Practice.{' '}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Compete.
              </span>{' '}
              Master Algorithms.
            </h1>

            <p className="text-base sm:text-lg text-theme-sub leading-relaxed max-w-xl mb-8">
              CodeArena is the modern competitive coding environment built for students, competitive programmers, and engineers. Solve curated problems, compete in weekly contests, and prepare for top tier technical interviews.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link to="/practice">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Target size={18} />}
                  className="px-6 py-3 shadow-lg shadow-blue-500/25"
                >
                  Start Practicing Free
                </Button>
              </Link>
              <Link to="/contests">
                <Button
                  variant="outline"
                  size="lg"
                  icon={<Trophy size={18} />}
                  className="px-6 py-3"
                >
                  Explore Contests
                </Button>
              </Link>
            </div>

            {/* Supporting Trust Metrics */}
            <div className="pt-6 border-t border-theme grid grid-cols-3 gap-6 max-w-lg text-xs text-theme-muted">
              <div>
                <span className="text-base sm:text-lg font-bold text-theme-main block">Real-time</span>
                <span className="text-theme-muted">Output Verification</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-theme-main block">Multi-Lang</span>
                <span className="text-theme-muted">Python, C++, Java</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-emerald-500 block">100% Free</span>
                <span className="text-theme-muted">Zero Subscriptions</span>
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor Mock Window */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-theme bg-theme-card shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-blue-500/10">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-theme bg-theme-surface">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1 bg-theme-card rounded-lg p-0.5 border border-theme">
                  {['python', 'cpp', 'java'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        activeLang === lang
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-theme-muted hover:text-theme-main'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippet Area */}
              <div className="p-4 sm:p-5 font-mono text-xs overflow-x-auto leading-relaxed bg-[#0B101E] text-slate-200">
                <pre className="whitespace-pre">{codeSnippets[activeLang]}</pre>
              </div>

              {/* Console Mock Footer */}
              <div className="px-4 py-3 border-t border-theme bg-theme-surface flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 size={15} /> Output Verified • All Tests Passed
                </span>
                <span className="text-theme-muted">24ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Dedicated Platform Metrics Bar (Clean 4-Column Card Grid) ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="p-8 space-y-4 rounded-2xl border border-theme bg-theme-card hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-200 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-theme-main font-mono tracking-tight">
                    {loadingStats ? <Spinner size="sm" /> : item.value}
                  </span>
                  <div className="p-2.5 rounded-xl border border-theme bg-theme-surface shadow-sm">
                    <Icon size={20} className={item.color} />
                  </div>
                </div>
                <p className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                  {item.label}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── 3. Competitive Contest Arena Section ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-8 sm:p-12 lg:p-14 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <Badge variant="upcoming" icon={<Trophy size={13} />} className="mb-2">
                Live & Upcoming Competitions
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight leading-tight">
                Competitive Contest Arena
              </h2>
              <p className="text-sm sm:text-base text-theme-sub leading-relaxed">
                Compete against peers in timed algorithmic challenges, solve data structures problems under time limits, and climb the live global leaderboard.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link to="/contests">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Trophy size={18} />}
                  className="px-6 py-3 shadow-lg shadow-blue-500/25"
                >
                  Explore Contests Arena
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-theme text-xs sm:text-sm text-theme-muted">
            <div className="flex items-center gap-6 flex-wrap">
              <span className="flex items-center gap-2 font-medium text-theme-sub">
                ⏱️ Real-time Leaderboards
              </span>
              <span>•</span>
              <span className="flex items-center gap-2 font-medium text-theme-sub">
                🔒 Hidden Test Case Validation
              </span>
              <span>•</span>
              <span className="flex items-center gap-2 font-medium text-theme-sub">
                💻 Python, C++, Java
              </span>
            </div>
            <span className="font-bold text-blue-500">Rated Rounds</span>
          </div>
        </div>
      </section>

      {/* ── 4. Key Feature Cards (Structured Grid with Generous Padding) ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
          <Badge variant="purple" className="mb-2">Built For Coders</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight">
            Engineered For Focused Problem Solving
          </h2>
          <p className="text-sm sm:text-base text-theme-sub leading-relaxed">
            A developer-first suite of tools built to take you from algorithmic beginner to competitive master.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <Card
              key={i}
              hover
              className="p-8 sm:p-10 space-y-4 rounded-2xl border border-theme bg-theme-card shadow-md transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-2xl border border-theme bg-theme-surface flex items-center justify-center shadow-sm mb-2">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-theme-main">{f.title}</h3>
              <p className="text-sm text-theme-sub leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 5. Call to Action Banner ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-theme bg-theme-card p-10 sm:p-14 lg:p-16 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight">
              Ready to Test Your Skills?
            </h2>
            <p className="text-sm sm:text-base text-theme-sub leading-relaxed">
              Join registered developers solving challenges and competing in algorithmic contests.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/practice">
              <Button
                variant="primary"
                size="lg"
                icon={<Target size={18} />}
                className="px-6 py-3 shadow-lg shadow-blue-500/25"
              >
                Start Solving Problems
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button
                variant="outline"
                size="lg"
                icon={<Trophy size={18} />}
                className="px-6 py-3"
              >
                View Global Rankings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
