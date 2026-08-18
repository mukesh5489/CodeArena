/**
 * aiController.js – Controller for Google Gemini AI Assistant Endpoints
 */

const aiService = require('../services/aiService');

/**
 * POST /api/ai/hint
 * Body: { problemTitle, problemDescription, userCode, language, hintLevel }
 */
async function getHint(req, res) {
  try {
    const { problemTitle, problemDescription, userCode, language, hintLevel } = req.body;
    if (!problemTitle || !problemDescription) {
      return res.status(400).json({ success: false, error: 'Problem title and description required.' });
    }

    const hint = await aiService.generateHint({
      problemTitle,
      problemDescription,
      userCode,
      language,
      hintLevel,
    });

    return res.json({ success: true, data: { hint } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai/explain
 * Body: { problemTitle, problemDescription, difficulty, topic }
 */
async function getApproach(req, res) {
  try {
    const { problemTitle, problemDescription, difficulty, topic } = req.body;
    if (!problemTitle || !problemDescription) {
      return res.status(400).json({ success: false, error: 'Problem title and description required.' });
    }

    const explanation = await aiService.explainApproach({
      problemTitle,
      problemDescription,
      difficulty,
      topic,
    });

    return res.json({ success: true, data: { explanation } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai/review
 * Body: { problemTitle, problemDescription, userCode, language, errorOutput }
 */
async function reviewCode(req, res) {
  try {
    const { problemTitle, problemDescription, userCode, language, errorOutput } = req.body;
    if (!userCode) {
      return res.status(400).json({ success: false, error: 'User code is required to review.' });
    }

    const review = await aiService.reviewCode({
      problemTitle,
      problemDescription,
      userCode,
      language,
      errorOutput,
    });

    return res.json({ success: true, data: { review } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai/chat
 * Body: { message, problemTitle, problemDescription, userCode, language, chatHistory }
 */
async function chat(req, res) {
  try {
    const { message, problemTitle, problemDescription, userCode, language, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const response = await aiService.chatAssistant({
      message,
      problemTitle,
      problemDescription,
      userCode,
      language,
      chatHistory,
    });

    return res.json({ success: true, data: { reply: response } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getHint,
  getApproach,
  reviewCode,
  chat,
};
