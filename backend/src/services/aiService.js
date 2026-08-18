/**
 * aiService.js – Google Gemini AI Assistance Engine
 *
 * Powers:
 *  - Algorithmic hints (without spoiling full solution)
 *  - Step-by-step approach explanations & time complexity analysis
 *  - Code review & bug detection
 *  - Interactive AI coding mentor chat
 */

const https = require('https');
const config = require('../config/app');

const GEMINI_API_KEY = config.geminiApiKey;
const MODELS = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-flash-lite'];

/**
 * Low-level call to Google Gemini GenerateContent API
 */
async function callGemini(prompt, systemInstruction = '') {
  if (!GEMINI_API_KEY) {
    throw new Error('Google Gemini API Key is not configured.');
  }

  for (const model of MODELS) {
    try {
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const body = JSON.stringify(payload);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const resText = await new Promise((resolve, reject) => {
        const req = https.request(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
            },
            timeout: 25000,
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(data);
              } else {
                reject(new Error(`Gemini ${model} HTTP ${res.statusCode}: ${data}`));
              }
            });
          }
        );

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Gemini API request timed out'));
        });
        req.write(body);
        req.end();
      });

      const parsed = JSON.parse(resText);
      const candidate = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return candidate.trim();
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err.message);
    }
  }

  throw new Error('Failed to generate AI response from Gemini models.');
}

/**
 * 1. Generate Progressive Algorithmic Hint
 */
async function generateHint({ problemTitle, problemDescription, userCode, language, hintLevel = 1 }) {
  const systemPrompt = `You are an expert competitive programming tutor on CodeArena. Your goal is to guide students to solve the problem on their own without giving away full code solutions.`;

  const levelInstructions = [
    'Give a gentle intuitive hint (Level 1): focus on the problem perspective, pattern recognition, or edge case to watch out for.',
    'Give a moderate structural hint (Level 2): recommend the optimal data structure or algorithmic technique (e.g. Two Pointers, Hash Map, DP state, Monotonic Stack).',
    'Give a detailed step-by-step algorithmic breakdown (Level 3): outline the logic and pseudocode steps, but DO NOT provide full copy-paste implementation.',
  ];

  const prompt = `
Problem Title: "${problemTitle}"
Problem Statement:
${problemDescription}

Student's Current Code (${language || 'Python'}):
\`\`\`${language || 'python'}
${userCode || '// No code written yet'}
\`\`\`

Request:
${levelInstructions[Math.min(Math.max(Number(hintLevel) - 1, 0), 2)]}

Format your output in clean Markdown with bullet points where appropriate.
`;

  return await callGemini(prompt, systemPrompt);
}

/**
 * 2. Explain Intuition, Pattern & Optimal Complexity
 */
async function explainApproach({ problemTitle, problemDescription, difficulty, topic }) {
  const systemPrompt = `You are a top-tier algorithmic mentor on CodeArena explaining competitive programming problems.`;

  const prompt = `
Problem: "${problemTitle}"
Difficulty: ${difficulty || 'Medium'}
Topic: ${topic || 'Data Structures & Algorithms'}

Problem Description:
${problemDescription}

Please provide:
1. 💡 **Core Intuition & Observation**: The "Aha!" insight that simplifies this problem.
2. 🛠️ **Optimal Algorithmic Approach**: Step-by-step explanation of the optimal strategy.
3. ⏱️ **Time & Space Complexity Analysis**: Target Big-O time and space complexity with concise reasoning.
4. ⚠️ **Common Pitfalls & Edge Cases**: Key edge cases that fail test cases.
`;

  return await callGemini(prompt, systemPrompt);
}

/**
 * 3. Review Code & Point Out Logical/Syntax Bugs
 */
async function reviewCode({ problemTitle, problemDescription, userCode, language, errorOutput }) {
  const systemPrompt = `You are an expert code reviewer and debugger on CodeArena. Analyze the student's submission, point out the exact bug or inefficiency, explain why it fails, and how to fix it conceptually.`;

  const prompt = `
Problem: "${problemTitle}"
Problem Statement:
${problemDescription}

Language: ${language || 'Python'}
Student's Submitted Code:
\`\`\`${language || 'python'}
${userCode}
\`\`\`

${errorOutput ? `Compiler / Test Error:\n${errorOutput}\n` : ''}

Please analyze:
1. 🐛 **Detected Bug / Logical Flaw**: What specifically causes the error or Wrong Answer.
2. 🔍 **Why it fails**: Explain the test scenario or edge case where this breaks (e.g. duplicate elements, negative numbers, boundary indices, integer overflow).
3. 💡 **Recommended Fix**: Provide guidance on what to adjust in the logic.
`;

  return await callGemini(prompt, systemPrompt);
}

/**
 * 4. Interactive AI Chat with Context
 */
async function chatAssistant({ message, problemTitle, problemDescription, userCode, language, chatHistory = [] }) {
  const systemPrompt = `You are CodeArena AI — a friendly, genius competitive programming and coding assistant. Help the student with any questions regarding algorithms, data structures, debugging, or concept explanations. Always be concise, encouraging, and format code with syntax highlighting.`;

  let historyContext = '';
  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    historyContext = chatHistory
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');
  }

  const prompt = `
Context:
Problem: ${problemTitle || 'General Coding'}
${problemDescription ? `Problem Description: ${problemDescription.slice(0, 500)}...` : ''}
${userCode ? `Current Editor Code (${language}):\n\`\`\`${language}\n${userCode.slice(0, 1000)}\n\`\`\`` : ''}

${historyContext ? `Chat History:\n${historyContext}\n` : ''}

User Query: "${message}"
`;

  return await callGemini(prompt, systemPrompt);
}

module.exports = {
  generateHint,
  explainApproach,
  reviewCode,
  chatAssistant,
};
