-- ==============================================================================
-- CodeArena Realistic Seed Data (for Supabase)
-- ==============================================================================
-- Run this SQL in the Supabase SQL Editor AFTER running schema.sql
-- ==============================================================================

-- 1. Insert Default Admin & Sample Student
INSERT INTO users (id, google_id, name, email, avatar_url, role)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin_google_id_001', 'Admin CodeArena', 'admin@codearena.dev', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'ADMIN'),
    ('22222222-2222-2222-2222-222222222222', 'student_google_id_002', 'Alex Coder', 'alex@example.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=alex', 'USER'),
    ('33333333-3333-3333-3333-333333333333', 'student_google_id_003', 'Sarah Dev', 'sarah@example.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah', 'USER')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Coding Problems
-- Problem 1: Two Sum
INSERT INTO problems (id, title, description, difficulty, type, topic, input_format, output_format, constraints, sample_input, sample_output, points, time_limit, memory_limit)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    'EASY',
    'CODING',
    'Arrays',
    'First line contains integer N (array length) and target T.\nSecond line contains N space-separated integers.',
    'Print the two indices separated by a space.',
    '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    '4 9\n2 7 11 15',
    '0 1',
    100,
    2000,
    256
) ON CONFLICT (id) DO NOTHING;

-- Problem 2: Palindrome Number
INSERT INTO problems (id, title, description, difficulty, type, topic, input_format, output_format, constraints, sample_input, sample_output, points, time_limit, memory_limit)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Palindrome Number',
    'Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\nFor example, 121 is a palindrome while 123 is not.',
    'EASY',
    'CODING',
    'Mathematics',
    'Single integer x.',
    'Print "true" if x is a palindrome, otherwise "false".',
    '-2^31 <= x <= 2^31 - 1',
    '121',
    'true',
    100,
    2000,
    256
) ON CONFLICT (id) DO NOTHING;

-- Problem 3: Valid Parentheses
INSERT INTO problems (id, title, description, difficulty, type, topic, input_format, output_format, constraints, sample_input, sample_output, points, time_limit, memory_limit)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Valid Parentheses',
    'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    'MEDIUM',
    'CODING',
    'Stack',
    'Single string s containing bracket characters.',
    'Print "true" if valid, otherwise "false".',
    '1 <= s.length <= 10^4\ns consists of parentheses only "()[]{}"',
    '()[]{}',
    'true',
    150,
    2000,
    256
) ON CONFLICT (id) DO NOTHING;

-- Problem 4: MCQ - Time Complexity of Binary Search
INSERT INTO problems (id, title, description, difficulty, type, topic, points)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Time Complexity of Binary Search',
    'What is the worst-case time complexity of Binary Search on a sorted array of size N?',
    'EASY',
    'MCQ',
    'Searching',
    50
) ON CONFLICT (id) DO NOTHING;

-- Problem 5: MCQ - Stack Principle
INSERT INTO problems (id, title, description, difficulty, type, topic, points)
VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Stack Data Structure Principle',
    'Which of the following principles does a standard Stack data structure adhere to?',
    'EASY',
    'MCQ',
    'Stack',
    50
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Test Cases for Two Sum
INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4 9\n2 7 11 15', '0 1', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '3 6\n3 2 4', '1 2', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2 6\n3 3', '0 1', false),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '5 10\n1 2 3 7 9', '2 3', false);

-- Insert Test Cases for Palindrome Number
INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
VALUES 
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '121', 'true', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '-121', 'false', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '10', 'false', false),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '12321', 'true', false);

-- Insert Test Cases for Valid Parentheses
INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
VALUES 
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '()[]{}', 'true', true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '(]', 'false', true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '([{}])', 'true', false),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '((((', 'false', false);

-- 4. Insert MCQ Options
-- For Problem 4 (Binary Search)
INSERT INTO mcq_options (problem_id, option_text, is_correct)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'O(1)', false),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'O(log N)', true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'O(N)', false),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'O(N log N)', false);

-- For Problem 5 (Stack)
INSERT INTO mcq_options (problem_id, option_text, is_correct)
VALUES 
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'FIFO (First In First Out)', false),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'LIFO (Last In First Out)', true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Random Access', false),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Priority Based', false);

-- 5. Insert Sample Contests
-- Contest 1: Upcoming Weekly #12
INSERT INTO contests (id, title, description, start_time, end_time, duration, status, created_by)
VALUES (
    '99999999-9999-9999-9999-999999999999',
    'CodeArena Weekly #12',
    'Test your algorithmic problem solving skills in our weekly 2-hour contest. Rated for all participants.',
    timezone('utc'::text, now() + interval '2 days'),
    timezone('utc'::text, now() + interval '2 days' + interval '2 hours'),
    120,
    'PUBLISHED',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- Contest 2: Live Speed Challenge
INSERT INTO contests (id, title, description, start_time, end_time, duration, status, created_by)
VALUES (
    '88888888-8888-8888-8888-888888888888',
    'CodeArena Live Speed Sprint',
    'Short 1-hour rapid-fire coding competition featuring array manipulation and data structures.',
    timezone('utc'::text, now() - interval '15 minutes'),
    timezone('utc'::text, now() + interval '45 minutes'),
    60,
    'LIVE',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- Contest 3: Completed Weekly #11
INSERT INTO contests (id, title, description, start_time, end_time, duration, status, created_by)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    'CodeArena Weekly #11',
    'Past weekly challenge. Problems are now open for public practice.',
    timezone('utc'::text, now() - interval '7 days'),
    timezone('utc'::text, now() - interval '7 days' + interval '2 hours'),
    120,
    'COMPLETED',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- 6. Link Problems to Live Contest
INSERT INTO contest_problems (contest_id, problem_id, order_number)
VALUES 
    ('88888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1),
    ('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2),
    ('88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3)
ON CONFLICT DO NOTHING;
