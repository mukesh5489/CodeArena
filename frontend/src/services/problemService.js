/**
 * problemService.js – Problems API client
 */

import api from './api';

/**
 * Fetch all problems with optional filters
 */
export const getProblems = async (filters = {}) => {
  const params = {};
  if (filters.difficulty && filters.difficulty !== 'ALL') params.difficulty = filters.difficulty;
  if (filters.type && filters.type !== 'ALL') params.type = filters.type;
  if (filters.topic && filters.topic !== 'ALL') params.topic = filters.topic;
  if (filters.search) params.search = filters.search;

  const res = await api.get('/problems', { params });
  return res.data;
};

/**
 * Fetch a single problem by ID
 */
export const getProblem = async (id) => {
  const res = await api.get(`/problems/${id}`);
  return res.data;
};

/**
 * Create a new problem (Admin only)
 * @param {Object} payload - { title, description, difficulty, type, topic, points, sample_input, sample_output, hidden_test_cases, ... }
 */
export const createProblem = async (payload) => {
  const res = await api.post('/problems', payload);
  return res.data;
};

/**
 * Delete a problem (Admin only)
 */
export const deleteProblem = async (id) => {
  const res = await api.delete(`/problems/${id}`);
  return res.data;
};
