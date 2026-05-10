import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LayoutDashboard, FolderKanban, Wrench, User, LogOut, Mail, Link2, ExternalLink, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Luôn ưu tiên tiếng Việt cho trang Admin
    if (i18n.language !== 'vi') {
      i18n.changeLanguage('vi');
    }
  }, [i18n]);

  // Đóng sidebar khi chuyển trang trên mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      toast.success('Đã đăng xuất thành công!');
      navigate('/');
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
      toast.error('Có lỗi xảy ra khi đăng xuất.');
    }
  };

  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.dashboard') },
    { to: '/admin/projects', icon: FolderKanban, label: t('admin.projects') },
    { to: '/admin/skills', icon: Wrench, label: t('admin.skills') },
    { to: '/admin/socials', icon: Link2, label: 'Mạng xã hội' },
    { to: '/admin/profile', icon: User, label: t('admin.profile') },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-900 flex flex-col transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {t('admin.title')}
          </h2>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.to ? 'bg-primary/10 text-primary' : 'hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-primary hover:bg-primary/10 transition-colors"
          >
            <ExternalLink size={20} /> Quay lại trang chủ
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={20} /> {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 lg:px-8 shrink-0">
          <button 
            className="lg:hidden mr-4 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold truncate">
            {menuItems.find(item => item.to === location.pathname)?.label || t('admin.dashboard')}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

