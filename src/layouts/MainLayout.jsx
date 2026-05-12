import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Languages, Heart, Link as LinkIcon, Menu, X } from 'lucide-react';
import { getProfile, getSocials } from '../services/firebase';
import Chatbot from '../components/Chatbot';

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [socials, setSocials] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMenuOpen(false);
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

  const navLinks = [
    { href: "#about", label: t('nav.about') },
    { href: "#skills", label: t('nav.skills') },
    { href: "#projects", label: t('nav.projects') },
    { href: "#contact", label: t('nav.contact') },
    { href: "/gallery", label: "Gallery" },
  ];

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
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-primary'}`}>{link.label}</a>
              ))}
              <Link to="/admin" className="text-primary hover:text-primary-400 transition-colors border-l border-current/10 pl-6 ml-2 uppercase">Dashboard</Link>
            </nav>

            <div className={`flex items-center gap-2 md:gap-3 ${!isMobile ? 'border-l' : ''} ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} md:pl-6`}>
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

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900'}`}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-40 md:hidden ${theme === 'dark' ? 'bg-slate-950/98' : 'bg-white/98'} backdrop-blur-2xl flex flex-col`}
          >
            <div className="flex-1 flex flex-col justify-center px-10 gap-6">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {link.href.startsWith('#') ? (
                    <a 
                      href={link.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-baseline gap-4"
                    >
                      <span className="text-primary font-mono text-[10px]">0{idx + 1}.</span>
                      <span className={`text-xl font-bold tracking-tight transition-all group-hover:text-primary ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {link.label}
                      </span>
                    </a>
                  ) : (
                    <Link 
                      to={link.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-baseline gap-4"
                    >
                      <span className="text-primary font-mono text-[10px]">0{idx + 1}.</span>
                      <span className={`text-xl font-bold tracking-tight transition-all group-hover:text-primary ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {link.label}
                      </span>
                    </Link>
                  )}
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-6 mt-4 border-t border-white/10 flex flex-col gap-4"
              >
                <Link 
                  to="/gallery" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="text-sm font-bold uppercase tracking-wider">View Gallery</span>
                  <div className="flex-grow h-px bg-white/5" />
                </Link>

                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-primary hover:text-primary-400 transition-colors"
                >
                  <span className="text-sm font-bold uppercase tracking-wider">Dashboard Access</span>
                  <div className="flex-grow h-px bg-primary/20" />
                </Link>
              </motion.div>
            </div>

            {/* Bottom info in mobile menu */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-10 border-t border-white/5 flex flex-col gap-4"
            >
              <div className="flex gap-4">
                {socials.map((social) => (
                  <a 
                    key={social.id} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <LinkIcon size={20} />
                  </a>
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                © {new Date().getFullYear()} {profile?.name || "Lam"} • Built with Passion
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
