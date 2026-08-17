# ⚡ CodeArena – College Competitive Programming Platform

CodeArena is a full-stack, modern, original competitive programming platform designed for college coding contests, practice arenas, and real-time algorithmic assessment.

---

## 🌟 Key Features

### 👤 Authentication & User Management
* **Google OAuth & JWT Sessions**: Secure token-based user authentication.
* **1-Click Test Logins**: Instant switch between Student and Administrator roles for demo & grading.
* **Role-Based Access Control (RBAC)**: Student vs Administrator portals with protected routes.
* **User Profiles**: Global rating, difficulty breakdown (Easy/Medium/Hard), solved problems counter, and contest participation history.

### 🏆 Contests & Competitions
* **Contest Lifecycle**: Support for `DRAFT`, `PUBLISHED` (Upcoming), `LIVE`, and `COMPLETED` rounds.
* **Live Contest Arena**: Integrated VS Code-style **Monaco Editor** with split problem statement pane, live timer countdown, and problem switcher tabs.
* **Multi-Language Support**: Write and run solutions in **Python 3**, **C++ (GCC)**, and **Java (OpenJDK)**.
* **MCQ Questions Support**: Integrated multiple-choice algorithmic questions with instant scoring.
* **Contest Leaderboards**: Real-time rank calculation with score aggregation and 10-minute wrong submission penalty logic.

### 📚 Practice Arena
* **Problem Bank**: Filter problems by Topic (*Arrays, Stack, Linked Lists, Graphs, DP, etc.*), Difficulty (*Easy, Medium, Hard*), and Type (*Coding, MCQ*).
* **Instant Sandbox Evaluation**: "Run Code" runs against public sample testcases; "Submit Solution" runs against all hidden testcases.
* **Execution Metrics**: Accurate reporting of execution time (ms), memory used (MB), and testcase pass/fail pill breakdown.

### 🛡️ Admin Portal (`/admin`)
* **Problem Authoring**: Create, edit, and configure problems, sample test cases, hidden test cases, time limits, and memory limits.
* **Contest Scheduler**: Schedule upcoming contests, define durations, attach problems, and monitor live status.

### 📧 Notifications & Transactional Emails
* **Email Confirmations**: Automatically dispatches contest registration confirmation emails via Resend.
* **In-App Notification Bell**: Real-time notification inbox with unread counter.

---

## 🏗️ Architecture & Tech Stack

```
User (Browser)
    │
    ▼
React Frontend (Vite on http://localhost:5173)
    │  • React Router 7 + AuthContext
    │  • Monaco Code Editor (@monaco-editor/react)
    │  • Tailwind CSS + Custom Dark Theme Tokens
    │  • Lucide React Icons & Axios Client
    ▼
Node.js + Express REST API (on http://localhost:5000)
    │  • Helmet, CORS, Rate Limiting, Morgan Logger
    │  • JWT Auth Middleware (requireAuth, requireAdmin)
    │  • Central Error Handler
    │
    ├── /api/health        – Server & DB status
    ├── /api/auth/*        – Google OAuth & demo logins
    ├── /api/contests/*    – Contests & leaderboards
    ├── /api/problems/*    – Problem bank & authoring
    ├── /api/submissions   – Code execution & history
    └── /api/notifications – In-app user notifications
    │
    ├──► Supabase PostgreSQL (10 Tables, Foreign Keys, Indexes)
    ├──► Judge0 Code Sandbox (Isolated Multi-language Execution)
    └──► Resend Email Service (Transactional Notifications)
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **npm**

### 2. Environment Setup
The project includes pre-configured environment files.
Verify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://hjqhstezkxzmqsojqdee.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

JWT_SECRET=4f8b9e6c2d1a3f5b7e9a0c2d4f6a8b0e1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f
```

### 3. Running the Platform

#### Start Backend (Terminal 1):
```bash
cd backend
npm run dev
```
> Running on `http://localhost:5000`

#### Start Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```
> Running on `http://localhost:5173`

---

## 🧪 Testing the Application

1. **Open** `http://localhost:5173`
2. **Sign In**:
   - Go to `/login` and click **"Demo Student"** (or **"Demo Admin"**)
3. **Practice**:
   - Go to `/practice`, select **Two Sum**, choose Python or C++, and click **Run Code** or **Submit Solution**.
4. **Contest Arena**:
   - Go to `/contests`, enter the **Live Speed Sprint**, and test the split-pane workspace with countdown timer.
5. **Admin Portal**:
   - Sign in as Admin and open `/admin` from the profile menu to create problems or schedule contests.
6. **Health Status**:
   - Check `http://localhost:5000/api/health` to verify server & PostgreSQL connectivity.
