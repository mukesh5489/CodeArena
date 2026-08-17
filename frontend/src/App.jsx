/**
 * App.jsx – CodeArena Application Router
 *
 * Full-Stack Routing Map with:
 *  - Public routes: Home, Login, Contests, Contest Detail, Practice, Leaderboard, UI Kit
 *  - Protected Student routes: Dashboard, Profile, Submissions
 *  - Protected Admin routes: /admin, /admin/problems, /admin/contests (requireAdmin)
 *  - Fullscreen Arena routes: Contest Arena (/contests/:id/arena), Practice Workspace (/practice/:id)
 *  - 404 Fallback
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';

// Student Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContestsPage from './pages/ContestsPage';
import ContestDetailPage from './pages/ContestDetailPage';
import ContestArenaPage from './pages/ContestArenaPage';
import PracticePage from './pages/PracticePage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SubmissionHistoryPage from './pages/SubmissionHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProblemsPage from './pages/admin/AdminProblemsPage';
import AdminContestsPage from './pages/admin/AdminContestsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Standard Navigation Pages (wrapped in Navbar + Footer) ── */}
            <Route element={<PublicLayout />}>
              <Route path="/"                 element={<HomePage />} />
              <Route path="/login"            element={<LoginPage />} />
              <Route path="/contests"         element={<ContestsPage />} />
              <Route path="/contests/:id"     element={<ContestDetailPage />} />
              <Route path="/practice"         element={<PracticePage />} />
              <Route path="/leaderboard"      element={<LeaderboardPage />} />

              {/* Protected Student Pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submissions"
                element={
                  <ProtectedRoute>
                    <SubmissionHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Pages */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/problems"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProblemsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/contests"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminContestsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ── Fullscreen Arena Pages ── */}
            <Route path="/contests/:id/arena" element={<ContestArenaPage />} />
            <Route path="/practice/:id"       element={<ProblemDetailPage />} />

            {/* ── 404 Not Found ── */}
            <Route path="*"                   element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

