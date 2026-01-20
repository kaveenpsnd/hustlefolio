import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Dashboard from '@/features/dashboard/Dashboard';
import GoalManagement from '@/features/goals/GoalManagement';
import CreateGoal from '@/features/goals/CreateGoal';
import GoalDetail from '@/features/goals/GoalDetail';
import PostEditor from '@/features/posts/PostEditor';
import PostViewer from '@/features/posts/PostViewer';
import MyPostsPage from '@/features/posts/MyPostsPage';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import ProfilePage from '@/features/users/ProfilePage';
import PublicProfilePage from '@/features/profile/PublicProfilePage';
import ExplorePage from '@/features/explore/ExplorePage';

// Admin Pages
import AdminLayout from '@/layouts/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Routes */}
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route path="/posts/:id" element={<PostViewer />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              {/* Default redirect to dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/edit" element={<ProfilePage />} />
              <Route path="/profile/:username" element={<PublicProfilePage />} />
              <Route path="/goals" element={<GoalManagement />} />
              <Route path="/goals/new" element={<CreateGoal />} />
              <Route path="/goals/edit/:id" element={<CreateGoal />} />
              <Route path="/goals/:id" element={<GoalDetail />} />
              <Route path="/my-posts" element={<MyPostsPage />} />
              <Route path="/create-post" element={<PostEditor />} />
              <Route path="/posts/new" element={<PostEditor />} />
              <Route path="/posts/:id/edit" element={<PostEditor />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
