/**
 * contestService.js
 *
 * All API calls related to contests.
 * Uses the shared Axios instance from api.js.
 */

import api from './api';

/**
 * Fetch all contests
 * @param {string} [status] - Optional filter: 'LIVE' | 'PUBLISHED' | 'COMPLETED'
 */
export const getContests = async (status) => {
  const params = status ? { status } : {};
  const res = await api.get('/contests', { params });
  return res.data;
};

/**
 * Fetch a single contest by ID
 * @param {string} id
 */
export const getContest = async (id) => {
  const res = await api.get(`/contests/${id}`);
  return res.data;
};

/**
 * Fetch problems for a specific contest (ordered)
 * @param {string} contestId
 */
export const getContestProblems = async (contestId) => {
  const res = await api.get(`/contests/${contestId}/problems`);
  return res.data;
};

/**
 * Fetch leaderboard for a specific contest
 * @param {string} contestId
 */
export const getContestLeaderboard = async (contestId) => {
  const res = await api.get(`/contests/${contestId}/leaderboard`);
  return res.data;
};

/**
 * Register the current user for a contest
 * @param {string} contestId
 */
export const registerForContest = async (contestId) => {
  const res = await api.post(`/contests/${contestId}/register`);
  return res.data;
};

/**
 * Create a new contest (Admin only)
 */
export const createContest = async (data) => {
  const res = await api.post('/contests', data);
  return res.data;
};

/**
 * Update a contest (Admin only)
 */
export const updateContest = async (id, data) => {
  const res = await api.patch(`/contests/${id}`, data);
  return res.data;
};

/**
 * Delete a contest (Admin only)
 */
export const deleteContest = async (id) => {
  const res = await api.delete(`/contests/${id}`);
  return res.data;
};

