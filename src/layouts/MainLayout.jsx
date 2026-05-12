import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sun, Moon, Languages, Heart, Link as LinkIcon } from 'lucide-react';
import { getProfile, getSocials } from '../services/firebase';
import Chatbot from '../components/Chatbot';

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [socials, setSocials] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const fetchData = async () => {
      const [profileData, socialsData] = await Promise.all([
        getProfile(),
        getSocials()
      ]);
      if (profileData) setProfile(profileData);
      setSocials(socialsData);
    };
    fetchData();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className={`min-h-screen relative text-foreground selection:bg-primary/30 selection:text-primary transition-colors ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* 🌌 OPTIMIZED GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Static Orbs for Mobile / Animated for Desktop to save battery */}
        <motion.div 
          animate={!isMobile ? { 
            scale: [1, 1.2, 1],
            x: [0, 40, 0],
            y: [0, 30, 0] 
          } : {}}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute top-[-10%] left-[-20%] md:left-[-10%] w-[100%] md:w-[60%] aspect-square rounded-full blur-[60px] md:blur-[130px] ${theme === 'dark' ? 'bg-indigo-600/20' : 'bg-blue-400/15'} will-change-transform`} 
        />
        <motion.div 
          animate={!isMobile ? { 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0] 
          } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute bottom-[-10%] right-[-20%] md:right-[-10%] w-[100%] md:w-[60%] aspect-square rounded-full blur-[60px] md:blur-[130px] ${theme === 'dark' ? 'bg-fuchsia-600/20' : 'bg-pink-400/15'} will-change-transform`} 
        />
        
        {/* Noise & Grid Overlay - Disabled Noise on mobile for performance */}
        {!isMobile && (
          <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${theme === 'dark' ? 'opacity-15' : 'opacity-10'} mix-blend-overlay`}></div>
        )}
        <div className={`absolute inset-0 bg-grid-slate-900/[0.08] ${theme === 'dark' ? 'opacity-100' : 'opacity-40'} [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]`}></div>
      </div>

      <header className={`fixed top-0 w-full z-50 transition-all border-b ${theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-white/40 border-slate-200'} backdrop-blur-md`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className={`text-xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            NTL<span className="text-primary">.</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className={`hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <a href="#about" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-primary'}`}>{t('nav.about')}</a>
              <a href="#skills" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-primary'}`}>{t('nav.skills')}</a>
              <a href="#projects" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-primary'}`}>{t('nav.projects')}</a>
              <a href="#contact" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-primary'}`}>{t('nav.contact')}</a>
              <Link to="/admin" className="text-primary hover:text-primary-400 transition-colors border-l border-current/10 pl-6 ml-2 uppercase">Dashboard</Link>
            </nav>

            <div className={`flex items-center gap-3 border-l ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} pl-6`}>
              <button 
                onClick={toggleLanguage}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <Languages size={16} />
                <span>{i18n.language}</span>
              </button>
              
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative pt-20">
        <Outlet />
      </main>

      <footer className={`relative z-10 border-t py-12 text-center text-[10px] font-mono uppercase tracking-[0.3em] ${theme === 'dark' ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
        <p>&copy; {new Date().getFullYear()} {t('hero.name')} • BUILT WITH PASSION</p>
      </footer>

      <Chatbot />
    </div>
  );
}
