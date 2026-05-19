import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Pages
const Home = lazy(() => import('./pages/Home'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Projects = lazy(() => import('./pages/Projects'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProjectsManager = lazy(() => import('./pages/admin/ProjectsManager'));
const SkillsManager = lazy(() => import('./pages/admin/SkillsManager'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));
const ProfileManager = lazy(() => import('./pages/admin/ProfileManager'));
const SocialsManager = lazy(() => import('./pages/admin/SocialsManager'));
const MessagesManager = lazy(() => import('./pages/admin/MessagesManager'));
const AiQaManager = lazy(() => import('./pages/admin/AiQaManager'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="projects" element={<Projects />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="skills" element={<SkillsManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="messages" element={<MessagesManager />} />
              <Route path="socials" element={<SocialsManager />} />
              <Route path="profile" element={<ProfileManager />} />
              <Route path="ai-qa" element={<AiQaManager />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
          },
        }} />
      </Router>
    </AuthProvider>
  );
}

export default App;
