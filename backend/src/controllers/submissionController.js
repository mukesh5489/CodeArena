/**
 * submissionController.js – Code Execution & Evaluation Controller
 */

const { supabase, isConfigured } = require('../database/supabase');
const { evaluateSubmission } = require('../services/judge0Service');

/**
 * POST /api/submissions/run
 * Runs user code against sample test cases only (No DB persistence required)
 */
async function runSampleCode(req, res) {
  try {
    const { problem_id, language, source_code } = req.body;

    if (!problem_id || !language || !source_code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: problem_id, language, source_code',
      });
    }

    const result = await evaluateSubmission({
      problemId: problem_id,
      language,
      sourceCode: source_code,
      isSampleOnly: true,
      userId: req.user?.id || null,
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Run Code Error:', err);
    return res.status(500).json({
      success: false,
      error: `Code execution failed: ${err.message}`,
    });
  }
}

/**
 * POST /api/submissions
 * Evaluates code against ALL hidden test cases, records verdict, and computes points
 */
async function createSubmission(req, res) {
  try {
    const { problem_id, language, source_code, contest_id } = req.body;

    if (!problem_id || !language || !source_code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: problem_id, language, source_code',
      });
    }

    // Require auth token to link submission to real user
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'You must be signed in to submit a solution.',
      });
    }

    const result = await evaluateSubmission({
      problemId: problem_id,
      language,
      sourceCode: source_code,
      isSampleOnly: false,
      userId,
      contestId: contest_id || null,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Submission Evaluation Error:', err);
    return res.status(500).json({
      success: false,
      error: `Submission evaluation failed: ${err.message}`,
    });
  }
}

/**
 * GET /api/submissions
 * Returns ALL submission history (admin overview or global)
 */
async function listSubmissions(req, res) {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, problems(title, difficulty, topic)')
        .order('submitted_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }
    return res.json({ success: true, data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/submissions/my
 * Returns submission history for the currently signed-in user only
 */
async function getMySubmissions(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, problems(title, difficulty, topic)')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Flatten problem_title for convenience
      const enriched = (data || []).map((s) => ({
        ...s,
        problem_title: s.problems?.title || s.problem_id,
        created_at: s.submitted_at,
      }));

      return res.json({ success: true, data: enriched });
    }

    return res.json({ success: true, data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  runSampleCode,
  createSubmission,
  listSubmissions,
  getMySubmissions,
};
