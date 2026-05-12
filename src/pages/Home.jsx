import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowRight } from 'lucide-react';
import AboutSection from '../components/sections/AboutSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import { getProfile, getProjects, getSkills, getSocials, incrementViews } from '../services/firebase';

export default function Home() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, projectsData, skillsData, socialsData] = await Promise.all([
          getProfile(),
          getProjects(),
          getSkills(),
          getSocials()
        ]);
        
        if (profileData) setProfile(profileData);
        setProjects(projectsData);
        setSkills(skillsData);
        setSocials(socialsData || []);

        const hasCounted = sessionStorage.getItem('hasCountedView');
        if (!hasCounted) {
          await incrementViews();
          sessionStorage.setItem('hasCountedView', 'true');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const name = t('hero.name').toUpperCase();
  const title = profile?.title || t('hero.build');

  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-6 py-12 flex flex-col gap-32 max-w-6xl relative z-10">
        {/* Hero Section */}
        <section id="hero" className="min-h-[90vh] flex flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-primary text-[10px] font-mono mb-8 w-fit tracking-[0.2em] uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('hero.hi')}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-[100px] font-black tracking-tighter text-foreground mb-6 leading-[0.9] drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
              {name.split(' ').map((word, i) => (
                <span key={i} className={i === name.split(' ').length - 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-500 to-pink-500 animate-gradient-x" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-xl md:text-3xl font-bold text-slate-600 dark:text-slate-400 mb-8 max-w-3xl leading-snug">
              {title}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <p className="text-slate-500 dark:text-slate-500 max-w-2xl text-lg mb-12 leading-relaxed font-medium">
              {profile?.about || t('hero.build')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap gap-6"
          >
            <a 
              href="#projects" 
              className="group relative px-10 py-4 bg-white text-slate-950 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {t('hero.cta')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            {profile?.cv_url && (
              <a 
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <FileText size={20} /> {t('nav.cv')}
              </a>
            )}
          </motion.div>
        </section>

        <AboutSection profile={profile} socials={socials} />
        <SkillsSection skills={skills} />
        <ProjectsSection projects={projects} />
        <ContactSection profile={profile} />
      </div>
    </div>
  );
}
