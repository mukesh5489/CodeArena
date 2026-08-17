/**
 * submissionService.js – Code Execution API calls
 */

import api from './api';

/**
 * Run code against sample test cases only
 * @param {Object} payload - { problem_id, language, source_code }
 */
export const runCode = async (payload) => {
  const res = await api.post('/submissions/run', payload);
  return res.data;
};

/**
 * Submit code for full evaluation against hidden test cases
 * @param {Object} payload - { problem_id, language, source_code, contest_id? }
 */
export const submitCode = async (payload) => {
  const res = await api.post('/submissions', payload);
  return res.data;
};

/**
 * Fetch the current user's submission history
 */
export const getSubmissions = async () => {
  const res = await api.get('/submissions');
  return res.data;
};
