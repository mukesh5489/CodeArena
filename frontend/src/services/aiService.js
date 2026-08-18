/**
 * aiService.js – Frontend API client for Google Gemini AI Assistant
 */

import api from './api';

/**
 * Get progressive algorithmic hint
 */
export const getAiHint = async ({ problemTitle, problemDescription, userCode, language, hintLevel = 1 }) => {
  const res = await api.post('/ai/hint', {
    problemTitle,
    problemDescription,
    userCode,
    language,
    hintLevel,
  });
  return res.data;
};

/**
 * Get deep approach explanation and time/space complexity analysis
 */
export const getAiApproach = async ({ problemTitle, problemDescription, difficulty, topic }) => {
  const res = await api.post('/ai/explain', {
    problemTitle,
    problemDescription,
    difficulty,
    topic,
  });
  return res.data;
};

/**
 * Review user code for bugs and logic issues
 */
export const reviewAiCode = async ({ problemTitle, problemDescription, userCode, language, errorOutput }) => {
  const res = await api.post('/ai/review', {
    problemTitle,
    problemDescription,
    userCode,
    language,
    errorOutput,
  });
  return res.data;
};

/**
 * Interactive chat with AI Coding Mentor
 */
export const sendAiChat = async ({ message, problemTitle, problemDescription, userCode, language, chatHistory = [] }) => {
  const res = await api.post('/ai/chat', {
    message,
    problemTitle,
    problemDescription,
    userCode,
    language,
    chatHistory,
  });
  return res.data;
};
