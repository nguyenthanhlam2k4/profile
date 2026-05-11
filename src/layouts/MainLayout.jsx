import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Languages, FileText, Heart, Mail as MailIcon, Link as LinkIcon } from 'lucide-react';
import { getProfile, getSocials } from '../services/firebase';

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [profileData, socialsData] = await Promise.all([
        getProfile(),
        getSocials()
      ]);
      if (profileData) setProfile(profileData);
      setSocials(socialsData);
    };
    fetchData();
  }, []);

  const getSocialIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('github')) return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
    );
    if (p.includes('linkedin')) return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
    );
    if (p.includes('facebook')) return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    );
    if (p.includes('instagram')) return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    );
    if (p.includes('locket')) return <Heart size={20} />;
    return <LinkIcon size={20} />; 
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary transition-colors">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            NTL.
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-medium">
              <a href="#about" className="hover:text-primary transition-colors">{t('nav.about')}</a>
              <a href="#skills" className="hover:text-primary transition-colors">{t('nav.skills')}</a>
              <a href="#projects" className="hover:text-primary transition-colors">{t('nav.projects')}</a>
              <a href="#contact" className="hover:text-primary transition-colors">{t('nav.contact')}</a>

              <Link to="/admin" className="text-primary/70 hover:text-primary transition-colors border-l border-border pl-8 ml-2">{t('nav.dashboard')}</Link>
            </nav>

            <div className="flex items-center gap-3 border-l border-border pl-6">
              <button 
                onClick={toggleLanguage}
                className="p-2 hover:bg-card rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
                title="Switch Language"
              >
                <Languages size={18} />
                <span className="uppercase">{i18n.language}</span>
              </button>
              
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-card rounded-full transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {t('hero.name')}. All rights reserved.</p>
      </footer>
    </div>
  );
}
