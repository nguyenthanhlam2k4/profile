import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProjectsManager from './pages/admin/ProjectsManager';
import SkillsManager from './pages/admin/SkillsManager';
import ProfileManager from './pages/admin/ProfileManager';
import MessagesManager from './pages/admin/MessagesManager';
import SocialsManager from './pages/admin/SocialsManager';
import Gallery from './pages/Gallery';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="gallery" element={<Gallery />} />
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
            <Route path="socials" element={<SocialsManager />} />
            <Route path="profile" element={<ProfileManager />} />
          </Route>
        </Routes>
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
