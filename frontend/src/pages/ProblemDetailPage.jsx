import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  Terminal,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Clock,
  HardDrive,
  Check,
  X,
  RotateCcw,
  Code2,
  Copy,
} from 'lucide-react';
import { Button, Badge, Select, Alert, Spinner } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { getProblem } from '../services/problemService';
import { runCode, submitCode } from '../services/submissionService';
import AiAssistantModal from '../components/ai/AiAssistantModal';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // MCQ state
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [mcqResult, setMcqResult] = useState(null);
  const [isMcqSubmitting, setIsMcqSubmitting] = useState(false);

  // Default starter templates
  const starterTemplates = {
    python: `# Write your solution below
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

    // Write your solution here
    
    return 0;
}
`,
    java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
    }
}
`,
  };

  useEffect(() => {
    const fetchProblemData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProblem(id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
        if (res?.data) {
          setProblem(res.data);
          setCode(starterTemplates[language]);
        }
      } catch (err) {
        console.warn('Failed to load problem details, using fallback problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id]);

  useEffect(() => {
    setCode(starterTemplates[language] || '');
    setEvalResult(null);
  }, [language]);

  const handleMcqSubmit = async () => {
    if (!selectedMcqOption) return;
    setIsMcqSubmitting(true);
    try {
      const res = await submitCode({
        problem_id: problem?.id || id,
        language: 'mcq',
        source_code: selectedMcqOption,
      });
      if (res?.data) {
        setMcqResult({
          passed: res.data.passed,
          message: res.data.passed ? '🎉 Correct Answer! Score recorded.' : '❌ Incorrect answer. Try again!',
        });
      }
    } catch (err) {
      setMcqResult({
        passed: false,
        message: 'Submission error: ' + (err.response?.data?.error || err.message),
      });
    } finally {
      setIsMcqSubmitting(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setEvalResult(null);
    setSelectedCaseIdx(0);
    try {
      const res = await runCode({
        problem_id: problem?.id || id,
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
    setIsSubmitting(true);
    setEvalResult(null);
    setSelectedCaseIdx(0);
    try {
      const res = await submitCode({
        problem_id: problem?.id || id,
        language,
        source_code: code,
      });
      if (res?.data) {
        setEvalResult(res.data);
      }
    } catch (err) {
      setEvalResult({
        verdict: 'Submission Failed',
        passed: false,
        error: err.response?.data?.error || err.message,
        testCases: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter template?')) {
      setCode(starterTemplates[language] || '');
      setEvalResult(null);
    }
  };

  const copySampleInput = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackProblem = {
    title: 'Two Sum',
    difficulty: 'EASY',
    type: 'CODING',
    topic: 'Arrays & Hashing',
    points: 100,
    time_limit: 2000,
    memory_limit: 256,
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    input_format:
      'First line contains integer N (array length) and target T.\nSecond line contains N space-separated integers.',
    output_format: 'Print the two zero-based indices separated by a single space.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    sample_input: '4 9\n2 7 11 15',
    sample_output: '0 1',
  };

  const currentProblem = problem || fallbackProblem;

  const diffColor = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-70px)] flex items-center justify-center bg-theme-page">
        <Spinner size="lg" label="Loading problem workspace…" />
      </div>
    );
  }

  const selectedCase = evalResult?.testCases?.[selectedCaseIdx] || null;

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col bg-theme-page overflow-hidden">
      {/* Top Breadcrumb Bar */}
      <div className="h-13 border-b border-theme bg-theme-card px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/practice"
            className="flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-blue-500 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Problems
          </Link>
          <span className="text-theme-muted">/</span>
          <h1 className="text-xs sm:text-sm font-bold text-theme-main truncate max-w-xs sm:max-w-md">
            {currentProblem.title}
          </h1>
          <Badge variant={diffColor[currentProblem.difficulty] || 'easy'}>
            {currentProblem.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-theme-muted">
          <span className="flex items-center gap-1">
            <Clock size={13} /> {currentProblem.time_limit || 2000}ms
          </span>
          <span className="flex items-center gap-1">
            <HardDrive size={13} /> {currentProblem.memory_limit || 256}MB
          </span>
          <span className="font-mono text-amber-500 font-bold">
            {currentProblem.points || 100} pts
          </span>
        </div>
      </div>

      {/* Main Split Layout: Left Problem Statement, Right Code Editor */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Problem Statement */}
        <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-theme bg-theme-card overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">
                {currentProblem.topic || 'Algorithm'}
              </span>
              <span className="text-theme-muted">•</span>
              <span className="text-xs text-theme-muted">{currentProblem.type || 'CODING'}</span>
            </div>
            <h2 className="text-xl font-extrabold text-theme-main">{currentProblem.title}</h2>
          </div>

          <div className="text-xs sm:text-sm text-theme-main leading-relaxed whitespace-pre-line font-sans">
            {currentProblem.description}
          </div>

          {currentProblem.input_format && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                Input Format
              </h3>
              <div className="text-xs font-mono bg-theme-surface border border-theme p-3.5 rounded-xl text-theme-main whitespace-pre-line">
                {currentProblem.input_format}
              </div>
            </div>
          )}

          {currentProblem.output_format && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                Output Format
              </h3>
              <div className="text-xs font-mono bg-theme-surface border border-theme p-3.5 rounded-xl text-theme-main whitespace-pre-line">
                {currentProblem.output_format}
              </div>
            </div>
          )}

          {currentProblem.constraints && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                Constraints
              </h3>
              <div className="text-xs font-mono bg-theme-surface border border-theme p-3.5 rounded-xl text-theme-main whitespace-pre-line">
                {currentProblem.constraints}
              </div>
            </div>
          )}

          {currentProblem.sample_input && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                  Sample Test Case
                </h3>
                <button
                  type="button"
                  onClick={() => copySampleInput(currentProblem.sample_input)}
                  className="flex items-center gap-1 text-[11px] text-theme-muted hover:text-blue-500 transition-colors cursor-pointer"
                >
                  <Copy size={12} /> {copied ? 'Copied!' : 'Copy Input'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-theme-muted font-semibold block">Input</span>
                  <pre className="text-xs font-mono bg-theme-surface border border-theme p-3 rounded-xl text-theme-main overflow-x-auto">
                    {currentProblem.sample_input}
                  </pre>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-theme-muted font-semibold block">Expected Output</span>
                  <pre className="text-xs font-mono bg-theme-surface border border-theme p-3 rounded-xl text-emerald-500 dark:text-emerald-400 overflow-x-auto">
                    {currentProblem.sample_output}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Editor or MCQ Quiz Interface */}
        {currentProblem.type === 'MCQ' ? (
          <div className="w-full lg:w-7/12 flex flex-col bg-theme-surface p-6 sm:p-8 justify-between overflow-y-auto">
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between">
                <Badge variant="purple" size="md">Multiple Choice Question</Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAiModalOpen(true)}
                  icon={<Sparkles size={13} className="text-amber-400" />}
                  className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                >
                  AI Mentor
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-theme-muted">
                  Select the best answer:
                </h3>
                <div className="space-y-3">
                  {(currentProblem.options || [
                    { id: 'opt-1', option_text: 'Option A' },
                    { id: 'opt-2', option_text: 'Option B' },
                    { id: 'opt-3', option_text: 'Option C' },
                    { id: 'opt-4', option_text: 'Option D' },
                  ]).map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3.5 p-4 rounded-xl border text-sm cursor-pointer transition-all ${
                        selectedMcqOption === opt.id
                          ? 'border-blue-500 bg-blue-500/10 text-theme-main font-bold shadow-md shadow-blue-500/10'
                          : 'border-theme bg-theme-card text-theme-muted hover:border-blue-500/40 hover:text-theme-main'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mcq-option"
                        checked={selectedMcqOption === opt.id}
                        onChange={() => setSelectedMcqOption(opt.id)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>{opt.option_text || opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleMcqSubmit}
                  disabled={!selectedMcqOption || isMcqSubmitting}
                  loading={isMcqSubmitting}
                  className="w-full sm:w-auto px-8"
                >
                  Submit Answer
                </Button>
              </div>

              {mcqResult && (
                <Alert variant={mcqResult.passed ? 'success' : 'error'}>
                  {mcqResult.message}
                </Alert>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-7/12 flex flex-col bg-theme-surface overflow-hidden">
            {/* Controls Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-theme bg-theme-card flex-wrap gap-2">
              <div className="flex items-center gap-2">
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
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="p-2 rounded-xl border border-theme bg-theme-surface text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
                  title="Reset code template"
                >
                  <RotateCcw size={14} />
                </button>
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
                  Run Code
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={isRunning}
                  icon={<Send size={13} />}
                >
                  Submit Solution
                </Button>
              </div>
            </div>

            {/* Monaco Code Editor */}
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

          {/* Sandboxed Execution Console Output Drawer */}
          {evalResult && (
            <div className="h-64 border-t border-theme bg-theme-card p-4 overflow-y-auto space-y-3 animate-fade-in font-mono text-xs shadow-lg">
              {/* Verdict Header */}
              <div className="flex items-center justify-between pb-2 border-b border-theme">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-theme-main">
                    <Terminal size={15} className="text-blue-500" />
                    <span>{evalResult.isSampleOnly ? 'Sample Run Result' : 'Submission Result'}</span>
                  </div>
                  <Badge variant={evalResult.passed ? 'easy' : 'hard'}>
                    {evalResult.verdict}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-theme-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {evalResult.executionTime || '0 ms'}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive size={12} /> {evalResult.memoryUsed || '0 MB'}
                  </span>
                  {evalResult.score !== undefined && (
                    <span className="text-emerald-500 font-bold font-mono">
                      +{evalResult.score} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Test Case Tab Selector */}
              {evalResult.testCases && evalResult.testCases.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {evalResult.testCases.map((tc, idx) => (
                      <button
                        key={tc.testCaseNumber}
                        type="button"
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                          selectedCaseIdx === idx
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-500 dark:text-blue-400 shadow-sm'
                            : 'border-theme bg-theme-surface text-theme-muted hover:text-theme-main'
                        }`}
                      >
                        {tc.passed ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <X size={12} className="text-rose-500" />
                        )}
                        <span>Case #{tc.testCaseNumber}</span>
                        <span className="text-[10px] opacity-75">
                          {tc.isSample ? '(Sample)' : '(Hidden)'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Detailed Selected Testcase View */}
                  {selectedCase && (
                    <div className="p-3.5 rounded-xl border border-theme bg-theme-surface space-y-3 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-theme-muted">
                        <span>
                          Verdict:{' '}
                          <strong
                            className={
                              selectedCase.passed ? 'text-emerald-500' : 'text-rose-500'
                            }
                          >
                            {selectedCase.verdict || (selectedCase.passed ? 'Accepted' : 'Wrong Answer')}
                          </strong>
                        </span>
                        <span>Execution Time: {selectedCase.time}</span>
                      </div>

                      {selectedCase.isSample ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-theme-muted uppercase">
                              Input
                            </span>
                            <pre className="p-2.5 rounded-lg bg-theme-card border border-theme text-theme-main overflow-x-auto">
                              {selectedCase.input || '(Empty input)'}
                            </pre>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-theme-muted uppercase">
                              Your Output
                            </span>
                            <pre
                              className={`p-2.5 rounded-lg bg-theme-card border overflow-x-auto ${
                                selectedCase.passed
                                  ? 'border-emerald-500/30 text-emerald-500'
                                  : 'border-rose-500/30 text-rose-500'
                              }`}
                            >
                              {selectedCase.actualOutput || '(No output)'}
                            </pre>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-theme-muted uppercase">
                              Expected Output
                            </span>
                            <pre className="p-2.5 rounded-lg bg-theme-card border border-emerald-500/30 text-emerald-500 overflow-x-auto">
                              {selectedCase.expectedOutput || '(None)'}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-theme-card border border-theme text-theme-muted text-xs">
                          {selectedCase.passed ? (
                            <p className="text-emerald-500 flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> Hidden Test Case Passed!
                            </p>
                          ) : (
                            <p className="text-rose-500 flex items-center gap-1.5">
                              <XCircle size={14} /> Hidden Test Case Failed. Your code produced incorrect output for hidden input.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Error Output */}
              {evalResult.error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs whitespace-pre-wrap">
                  {evalResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Google Gemini AI Mentor Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        problem={currentProblem}
        userCode={code}
        language={language}
      />
    </div>
  );
}
