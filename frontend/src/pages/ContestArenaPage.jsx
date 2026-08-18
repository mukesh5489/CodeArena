import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  HardDrive,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Button, Badge, Select, Card, Alert, Spinner } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { getContestProblems } from '../services/contestService';
import { runCode, submitCode } from '../services/submissionService';
import AiAssistantModal from '../components/ai/AiAssistantModal';

export default function ContestArenaPage() {
  const { id } = useParams();
  const { isDark } = useTheme();

  const [problems, setProblems] = useState([]);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // MCQ state
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [mcqResult, setMcqResult] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Live Timer countdown (45 mins demo)
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);

  const starterTemplates = {
    python: `# Write your contest solution below
import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    # Process input here
    print("Output")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your contest solution here
    
    return 0;
}
`,
    java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your contest solution here
        
    }
}
`,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await getContestProblems(id);
        if (res?.data && res.data.length > 0) {
          setProblems(res.data);
        } else {
          // Fallback mock contest problems
          setProblems([
            {
              id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              title: 'Two Sum',
              difficulty: 'EASY',
              type: 'CODING',
              topic: 'Arrays',
              points: 100,
              description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
              input_format: 'First line contains N and T.\nSecond line contains N space-separated integers.',
              output_format: 'Print two space-separated indices.',
              sample_input: '4 9\n2 7 11 15',
              sample_output: '0 1',
            },
            {
              id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
              title: 'Palindrome Number',
              difficulty: 'EASY',
              type: 'CODING',
              topic: 'Mathematics',
              points: 100,
              description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
              input_format: 'Single integer x.',
              output_format: 'Print "true" or "false".',
              sample_input: '121',
              sample_output: 'true',
            },
            {
              id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
              title: 'Time Complexity of Binary Search',
              difficulty: 'EASY',
              type: 'MCQ',
              topic: 'Searching',
              points: 50,
              description: 'What is the worst-case time complexity of searching in a sorted array of size N using binary search?',
              options: [
                { id: 'opt-1', text: 'O(1)', is_correct: false },
                { id: 'opt-2', text: 'O(log N)', is_correct: true },
                { id: 'opt-3', text: 'O(N)', is_correct: false },
                { id: 'opt-4', text: 'O(N log N)', is_correct: false },
              ],
            },
          ]);
        }
      } catch (err) {
        console.warn('Failed to load contest problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [id]);

  useEffect(() => {
    setCode(starterTemplates[language] || '');
    setEvalResult(null);
    setMcqResult(null);
    setSelectedMcqOption(null);
  }, [currentProblemIdx, language]);

  const activeProblem = problems[currentProblemIdx] || null;

  const handleRun = async () => {
    if (!activeProblem) return;
    setIsRunning(true);
    setEvalResult(null);
    setSelectedCaseIdx(0);
    try {
      const res = await runCode({
        problem_id: activeProblem.id,
        language,
        source_code: code,
      });
      if (res?.data) {
        setEvalResult(res.data);
      }
    } catch (err) {
      setEvalResult({
        verdict: 'Execution Error',
        passed: false,
        error: err.response?.data?.error || err.message,
        testCases: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeProblem) return;
    setIsSubmitting(true);
    setEvalResult(null);
    setSelectedCaseIdx(0);
    try {
      const res = await submitCode({
        problem_id: activeProblem.id,
        contest_id: id,
        language,
        source_code: code,
      });
      if (res?.data) {
        setEvalResult(res.data);
      }
    } catch (err) {
      setEvalResult({
        verdict: 'Submission Error',
        passed: false,
        error: err.response?.data?.error || err.message,
        testCases: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMcqSubmit = () => {
    if (!selectedMcqOption) return;
    const correctOpt = activeProblem.options?.find((o) => o.is_correct);
    const isCorrect = selectedMcqOption === correctOpt?.id;
    setMcqResult({
      passed: isCorrect,
      message: isCorrect
        ? '✅ Correct Answer! Points awarded.'
        : '❌ Incorrect answer. Please try again.',
    });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-68px)] flex items-center justify-center bg-theme-page">
        <Spinner size="lg" label="Entering contest arena…" />
      </div>
    );
  }

  const selectedCase = evalResult?.testCases?.[selectedCaseIdx] || null;

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col bg-theme-page overflow-hidden">
      {/* Top Contest Navigation & Timer Bar */}
      <div className="h-14 border-b border-theme bg-theme-card px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/contests/${id}`}
            className="flex items-center gap-1 text-xs font-bold text-theme-muted hover:text-blue-500 transition-colors"
          >
            <ArrowLeft size={14} /> Exit Arena
          </Link>
          <span className="text-theme-muted">|</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {problems.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => setCurrentProblemIdx(idx)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentProblemIdx === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-theme-surface text-theme-muted hover:text-theme-main border border-theme'
                }`}
              >
                P{idx + 1}: {p.title?.slice(0, 14)}…
              </button>
            ))}
          </div>
        </div>

        {/* Live Timer Indicator */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs">
            <Clock size={13} className="animate-pulse" />
            <span>Time Left: {formatTimer(secondsRemaining)}</span>
          </div>
          <Badge variant="live" size="sm">LIVE CONTEST</Badge>
        </div>
      </div>

      {/* Main Split Body */}
      {activeProblem && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Problem Panel */}
          <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-theme bg-theme-card p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={(activeProblem.difficulty || 'easy').toLowerCase()}>
                    {activeProblem.difficulty}
                  </Badge>
                  <span className="text-xs text-blue-500 font-bold">{activeProblem.topic}</span>
                </div>
                <h2 className="text-xl font-extrabold text-theme-main">
                  {currentProblemIdx + 1}. {activeProblem.title}
                </h2>
              </div>
              <span className="font-mono text-amber-500 font-bold text-sm">
                {activeProblem.points || 100} pts
              </span>
            </div>

            <div className="text-xs sm:text-sm text-theme-main leading-relaxed whitespace-pre-line font-sans">
              {activeProblem.description}
            </div>

            {/* MCQ Options (if Quiz problem) */}
            {activeProblem.type === 'MCQ' && activeProblem.options && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                  Choose the correct option:
                </h3>
                <div className="space-y-2">
                  {activeProblem.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedMcqOption === opt.id
                          ? 'border-blue-500 bg-blue-500/10 text-theme-main font-bold'
                          : 'border-theme bg-theme-surface text-theme-muted hover:border-blue-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mcq-option"
                        checked={selectedMcqOption === opt.id}
                        onChange={() => setSelectedMcqOption(opt.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleMcqSubmit}
                  disabled={!selectedMcqOption}
                >
                  Submit Answer
                </Button>

                {mcqResult && (
                  <Alert variant={mcqResult.passed ? 'success' : 'error'}>
                    {mcqResult.message}
                  </Alert>
                )}
              </div>
            )}

            {/* Coding I/O Specs */}
            {activeProblem.type !== 'MCQ' && (
              <>
                {activeProblem.input_format && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                      Input Format
                    </h3>
                    <div className="text-xs font-mono bg-theme-surface border border-theme p-3.5 rounded-xl text-theme-main whitespace-pre-line">
                      {activeProblem.input_format}
                    </div>
                  </div>
                )}

                {activeProblem.output_format && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                      Output Format
                    </h3>
                    <div className="text-xs font-mono bg-theme-surface border border-theme p-3.5 rounded-xl text-theme-main whitespace-pre-line">
                      {activeProblem.output_format}
                    </div>
                  </div>
                )}

                {activeProblem.sample_input && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                      Sample Case
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-theme-muted block mb-1">Input</span>
                        <pre className="p-2.5 rounded-lg bg-theme-surface border border-theme text-xs font-mono text-theme-main overflow-x-auto">
                          {activeProblem.sample_input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-theme-muted block mb-1">Output</span>
                        <pre className="p-2.5 rounded-lg bg-theme-surface border border-theme text-xs font-mono text-emerald-500 overflow-x-auto">
                          {activeProblem.sample_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Editor Panel */}
          {activeProblem.type !== 'MCQ' && (
            <div className="w-full lg:w-7/12 flex flex-col bg-theme-surface overflow-hidden">
              {/* Controls */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-theme bg-theme-card flex-wrap gap-2">
                <div className="w-40">
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    options={[
                      { value: 'python', label: 'Python 3' },
                      { value: 'cpp', label: 'C++ (GCC)' },
                      { value: 'java', label: 'Java (OpenJDK)' },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAiModalOpen(true)}
                    icon={<Sparkles size={13} className="text-amber-400" />}
                    className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                  >
                    AI Mentor
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRun}
                    loading={isRunning}
                    disabled={isSubmitting}
                    icon={<Play size={13} />}
                  >
                    Run Sample
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    disabled={isRunning}
                    icon={<Send size={13} />}
                  >
                    Submit Contest Solution
                  </Button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 min-h-[280px]">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'python'}
                  theme={isDark ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    tabSize: 4,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>

              {/* Console Drawer */}
              {evalResult && (
                <div className="h-60 border-t border-theme bg-theme-card p-4 overflow-y-auto space-y-3 animate-fade-in font-mono text-xs shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-theme">
                    <div className="flex items-center gap-2">
                      <Terminal size={15} className="text-blue-500" />
                      <span className="font-bold text-theme-main">
                        {evalResult.isSampleOnly ? 'Sample Run Verdict' : 'Contest Verdict'}
                      </span>
                      <Badge variant={evalResult.passed ? 'easy' : 'hard'}>
                        {evalResult.verdict}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-theme-muted">
                      <span>{evalResult.executionTime}</span>
                      <span>{evalResult.memoryUsed}</span>
                      {evalResult.score !== undefined && (
                        <span className="text-emerald-500 font-bold">+{evalResult.score} pts</span>
                      )}
                    </div>
                  </div>

                  {/* Test Cases Tabs */}
                  {evalResult.testCases && evalResult.testCases.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {evalResult.testCases.map((tc, idx) => (
                          <button
                            key={tc.testCaseNumber}
                            type="button"
                            onClick={() => setSelectedCaseIdx(idx)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                              selectedCaseIdx === idx
                                ? 'bg-blue-500/15 border-blue-500/40 text-blue-500'
                                : 'border-theme bg-theme-surface text-theme-muted hover:text-theme-main'
                            }`}
                          >
                            {tc.passed ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <X size={12} className="text-rose-500" />
                            )}
                            <span>Case #{tc.testCaseNumber}</span>
                          </button>
                        ))}
                      </div>

                      {selectedCase && selectedCase.isSample && (
                        <div className="p-3 rounded-xl border border-theme bg-theme-surface grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-theme-muted uppercase font-bold">Input</span>
                            <pre className="p-2 rounded bg-theme-card border border-theme text-theme-main overflow-x-auto">{selectedCase.input}</pre>
                          </div>
                          <div>
                            <span className="text-[10px] text-theme-muted uppercase font-bold">Your Output</span>
                            <pre className={`p-2 rounded bg-theme-card border overflow-x-auto ${selectedCase.passed ? 'text-emerald-500 border-emerald-500/30' : 'text-rose-500 border-rose-500/30'}`}>
                              {selectedCase.actualOutput}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[10px] text-theme-muted uppercase font-bold">Expected</span>
                            <pre className="p-2 rounded bg-theme-card border border-emerald-500/30 text-emerald-500 overflow-x-auto">{selectedCase.expectedOutput}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {evalResult.error && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                      {evalResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Google Gemini AI Mentor Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        problem={activeProblem}
        userCode={code}
        language={language}
      />
    </div>
  );
}
