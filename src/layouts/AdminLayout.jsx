import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LayoutDashboard, FolderKanban, Wrench, User, LogOut, Link2, ExternalLink, Menu, X, Image, MessageSquare, Bot } from 'lucide-react';
import { subscribeMessages } from '../services/firebase';

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

  // Lắng nghe thông báo tin nhắn mới thời gian thực
  useEffect(() => {
    let isInitialLoad = true;
    let previousCount = 0;
    
    const unsubscribe = subscribeMessages((data) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        previousCount = data.length;
        return;
      }
      
      const newCount = data.length;
      if (newCount > previousCount && data.length > 0) {
        const latestMessage = data[0];
        // Trigger a beautiful, custom toast notification!
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
            } max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(20,184,166,0.15)] pointer-events-auto flex overflow-hidden transition-all duration-300 relative`}
          >
            {/* Elegant side gradient stripe */}
            <div className="w-1.5 bg-gradient-to-b from-primary via-emerald-400 to-blue-500 shrink-0"></div>

            {/* Notification content */}
            <div className="flex-1 p-5">
              <div className="flex items-start gap-4">
                {/* Glowing Notification Icon Container */}
                <div className="relative shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-slate-950/80 border border-slate-800 text-primary shadow-inner">
                  {/* Ping effect for micro-animation */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  {/* Custom Mail Icon */}
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>

                {/* Text information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      Hộp thư liên hệ
                    </span>
                    <span className="text-[10px] text-primary/80 font-bold font-mono bg-primary/10 px-2 py-0.5 rounded-full">
                      Vừa xong
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white mt-1.5 leading-snug truncate">
                    Tin nhắn mới từ <span className="text-primary">{latestMessage.name}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1.5 truncate leading-relaxed">
                    <span className="font-bold text-slate-200">[{latestMessage.subject || 'Không có tiêu đề'}]</span> {latestMessage.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col border-l border-slate-800/80 w-28 divide-y divide-slate-800/60 shrink-0 bg-slate-950/20">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/admin/messages');
                }}
                className="flex-1 w-full flex items-center justify-center text-xs font-extrabold text-primary hover:text-white hover:bg-primary/10 active:bg-primary/20 transition-all duration-200 focus:outline-none"
              >
                Xem ngay
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="h-10 w-full flex items-center justify-center text-xs font-bold text-slate-500 hover:text-slate-200 hover:bg-slate-800/30 transition-all duration-200 focus:outline-none"
              >
                Đóng
              </button>
            </div>
          </div>
        ), { duration: 7000 });
      }
      previousCount = newCount;
    }, (error) => {
      console.error('Error listening to messages in layout:', error);
    });
    
    return () => unsubscribe();
  }, [navigate]);

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
    { to: '/admin/gallery', icon: Image, label: 'Quản lý ảnh' },
    { to: '/admin/messages', icon: MessageSquare, label: t('admin.messages') },
    { to: '/admin/socials', icon: Link2, label: 'Mạng xã hội' },
    { to: '/admin/profile', icon: User, label: t('admin.profile') },
    { to: '/admin/ai-qa', icon: Bot, label: 'Huấn luyện AI Q&A' },
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

