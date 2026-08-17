/**
 * problemController.js
 *
 * Handles all problem-related API logic.
 * When Supabase is not configured, returns realistic mock data.
 */

const { supabase, isConfigured } = require('../database/supabase');

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_PROBLEMS = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'EASY',
    type: 'CODING',
    topic: 'Arrays',
    input_format: 'First line contains integer N (array length) and target T.\nSecond line contains N space-separated integers.',
    output_format: 'Print the two indices separated by a space.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
    sample_input: '4 9\n2 7 11 15',
    sample_output: '0 1',
    points: 100,
    time_limit: 2000,
    memory_limit: 256,
    acceptance_rate: '49.8%',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Palindrome Number',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    difficulty: 'EASY',
    type: 'CODING',
    topic: 'Mathematics',
    input_format: 'Single integer x.',
    output_format: 'Print "true" if x is a palindrome, otherwise "false".',
    constraints: '-2^31 <= x <= 2^31 - 1',
    sample_input: '121',
    sample_output: 'true',
    points: 100,
    time_limit: 2000,
    memory_limit: 256,
    acceptance_rate: '54.2%',
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    difficulty: 'MEDIUM',
    type: 'CODING',
    topic: 'Stack',
    input_format: 'Single string s containing bracket characters.',
    output_format: 'Print "true" if valid, otherwise "false".',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only "()[]{}"',
    sample_input: '()[]{}',
    sample_output: 'true',
    points: 150,
    time_limit: 2000,
    memory_limit: 256,
    acceptance_rate: '41.1%',
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    title: 'Time Complexity of Binary Search',
    description: 'What is the worst-case time complexity of Binary Search on a sorted array of size N?',
    difficulty: 'EASY',
    type: 'MCQ',
    topic: 'Searching',
    points: 50,
    acceptance_rate: '82.4%',
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    title: 'Stack Data Structure Principle',
    description: 'Which of the following principles does a standard Stack data structure adhere to?',
    difficulty: 'EASY',
    type: 'MCQ',
    topic: 'Stack',
    points: 50,
    acceptance_rate: '91.0%',
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Find the length of the longest substring without repeating characters.',
    difficulty: 'MEDIUM',
    type: 'CODING',
    topic: 'Strings',
    input_format: 'A single string s.',
    output_format: 'Print a single integer – the length of the longest valid substring.',
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    sample_input: 'abcabcbb',
    sample_output: '3',
    points: 150,
    time_limit: 2000,
    memory_limit: 256,
    acceptance_rate: '33.8%',
  },
];

const MOCK_MCQ_OPTIONS = {
  'dddddddd-dddd-dddd-dddd-dddddddddddd': [
    { id: 'opt-d1', option_text: 'O(1)', is_correct: false },
    { id: 'opt-d2', option_text: 'O(log N)', is_correct: true },
    { id: 'opt-d3', option_text: 'O(N)', is_correct: false },
    { id: 'opt-d4', option_text: 'O(N log N)', is_correct: false },
  ],
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee': [
    { id: 'opt-e1', option_text: 'FIFO (First In First Out)', is_correct: false },
    { id: 'opt-e2', option_text: 'LIFO (Last In First Out)', is_correct: true },
    { id: 'opt-e3', option_text: 'Random Access', is_correct: false },
    { id: 'opt-e4', option_text: 'Priority Based', is_correct: false },
  ],
};

// ─── Controller Functions ────────────────────────────────────────────────────

/**
 * GET /api/problems
 * Query params: difficulty=EASY|MEDIUM|HARD, type=CODING|MCQ, topic=string, search=string
 */
const listProblems = async (req, res) => {
  const { difficulty, type, topic, search } = req.query;

  if (!isConfigured) {
    let problems = [...MOCK_PROBLEMS];

    if (difficulty) problems = problems.filter((p) => p.difficulty === difficulty.toUpperCase());
    if (type) problems = problems.filter((p) => p.type === type.toUpperCase());
    if (topic) problems = problems.filter((p) => p.topic.toLowerCase().includes(topic.toLowerCase()));
    if (search) {
      problems = problems.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.topic.toLowerCase().includes(search.toLowerCase())
      );
    }

    return res.json({
      success: true,
      data: problems,
      total: problems.length,
      source: 'mock',
    });
  }

  // Real query
  let query = supabase
    .from('problems')
    .select('id, title, difficulty, type, topic, points, time_limit, memory_limit');

  if (difficulty) query = query.eq('difficulty', difficulty.toUpperCase());
  if (type) query = query.eq('type', type.toUpperCase());
  if (topic) query = query.ilike('topic', `%${topic}%`);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, error: error.message });

  return res.json({ success: true, data, total: data.length });
};

/**
 * GET /api/problems/:id
 * Returns full problem with sample test cases (hidden test cases NOT sent to client)
 */
const getProblem = async (req, res) => {
  const { id } = req.params;

  if (!isConfigured) {
    const problem = MOCK_PROBLEMS.find((p) => p.id === id);
    if (!problem) return res.status(404).json({ success: false, error: 'Problem not found' });

    // For MCQ problems, attach options (hide is_correct: true from client in production)
    const options = MOCK_MCQ_OPTIONS[id] || null;

    return res.json({
      success: true,
      data: { ...problem, options: options ? options.map((o) => ({ id: o.id, option_text: o.option_text })) : null },
      source: 'mock',
    });
  }

  const { data: problem, error } = await supabase
    .from('problems')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ success: false, error: 'Problem not found' });

  // Fetch sample test cases only
  const { data: sampleCases } = await supabase
    .from('test_cases')
    .select('input, expected_output')
    .eq('problem_id', id)
    .eq('is_sample', true);

  // Fetch MCQ options (without is_correct flag for the student-facing API)
  let options = null;
  if (problem.type === 'MCQ') {
    const { data: opts } = await supabase
      .from('mcq_options')
      .select('id, option_text')
      .eq('problem_id', id);
    options = opts || [];
  }

  return res.json({
    success: true,
    data: { ...problem, sample_test_cases: sampleCases || [], options },
  });
};

/**
 * POST /api/problems (Admin only)
 * Creates a new coding or MCQ problem in Supabase with hidden & sample test cases
 */
const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty = 'EASY',
    type = 'CODING',
    topic = 'General',
    input_format,
    output_format,
    constraints,
    sample_input,
    sample_output,
    points = 100,
    time_limit = 2000,
    memory_limit = 256,
    hidden_test_cases = [],
    sample_test_cases = [],
    options = [],
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required' });
  }

  if (isConfigured && supabase) {
    const { data: newProb, error } = await supabase
      .from('problems')
      .insert({
        title,
        description,
        difficulty: difficulty.toUpperCase(),
        type: type.toUpperCase(),
        topic,
        input_format,
        output_format,
        constraints,
        sample_input,
        sample_output,
        points: Number(points),
        time_limit: Number(time_limit),
        memory_limit: Number(memory_limit),
      })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    const testCasesToInsert = [];

    // 1. Insert primary sample test case if provided
    if (sample_input && sample_output) {
      testCasesToInsert.push({
        problem_id: newProb.id,
        input: sample_input.trim(),
        expected_output: sample_output.trim(),
        is_sample: true,
      });
    }

    // 2. Insert any additional sample test cases
    if (Array.isArray(sample_test_cases)) {
      for (const tc of sample_test_cases) {
        if (tc.input && tc.expected_output) {
          testCasesToInsert.push({
            problem_id: newProb.id,
            input: tc.input.trim(),
            expected_output: tc.expected_output.trim(),
            is_sample: true,
          });
        }
      }
    }

    // 3. Insert HIDDEN test cases (Evaluated only during submission)
    if (Array.isArray(hidden_test_cases)) {
      for (const tc of hidden_test_cases) {
        if (tc.input && tc.expected_output) {
          testCasesToInsert.push({
            problem_id: newProb.id,
            input: tc.input.trim(),
            expected_output: tc.expected_output.trim(),
            is_sample: false,
          });
        }
      }
    }

    if (testCasesToInsert.length > 0) {
      await supabase.from('test_cases').insert(testCasesToInsert);
    }

    // 4. Insert MCQ options if MCQ problem
    if (type.toUpperCase() === 'MCQ' && Array.isArray(options)) {
      const optsToInsert = options.map((opt) => ({
        problem_id: newProb.id,
        option_text: opt.text || opt.option_text,
        is_correct: Boolean(opt.is_correct),
      }));
      if (optsToInsert.length > 0) {
        await supabase.from('mcq_options').insert(optsToInsert);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Problem and test cases saved successfully!',
      data: newProb,
    });
  }

  // Mock response
  const mockCreated = {
    id: `prob_${Date.now()}`,
    title,
    description,
    difficulty,
    type,
    topic,
    points,
  };
  return res.status(201).json({ success: true, data: mockCreated });
};

/**
 * PATCH /api/problems/:id (Admin only)
 * Update any fields of a problem
 */
const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title, description, difficulty, type, topic,
    points, time_limit, memory_limit,
    input_format, output_format, constraints,
    sample_input, sample_output,
  } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (difficulty !== undefined) updates.difficulty = difficulty.toUpperCase();
  if (type !== undefined) updates.type = type.toUpperCase();
  if (topic !== undefined) updates.topic = topic;
  if (points !== undefined) updates.points = Number(points);
  if (time_limit !== undefined) updates.time_limit = Number(time_limit);
  if (memory_limit !== undefined) updates.memory_limit = Number(memory_limit);
  if (input_format !== undefined) updates.input_format = input_format;
  if (output_format !== undefined) updates.output_format = output_format;
  if (constraints !== undefined) updates.constraints = constraints;
  if (sample_input !== undefined) updates.sample_input = sample_input;
  if (sample_output !== undefined) updates.sample_output = sample_output;

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('problems')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Problem updated!', data });
  }

  return res.json({ success: true, message: 'Problem updated (offline)', data: { id, ...updates } });
};

/**
 * DELETE /api/problems/:id (Admin only)
 */
const deleteProblem = async (req, res) => {
  const { id } = req.params;

  if (isConfigured && supabase) {
    // Delete test cases first
    await supabase.from('test_cases').delete().eq('problem_id', id);
    await supabase.from('mcq_options').delete().eq('problem_id', id);
    const { error } = await supabase.from('problems').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, message: 'Problem deleted successfully' });
};

module.exports = { listProblems, getProblem, createProblem, updateProblem, deleteProblem };

