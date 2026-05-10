import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import AboutSection from '../components/sections/AboutSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import { getProfile, getProjects, getSkills, incrementViews } from '../services/firebase';

export default function Home() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, projectsData, skillsData] = await Promise.all([
          getProfile(),
          getProjects(),
          getSkills()
        ]);
        
        if (profileData) setProfile(profileData);
        setProjects(projectsData);
        setSkills(skillsData);

        // Increment views if not already counted this session
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

  // Default values if profile is not loaded or doesn't exist
  const name = profile?.name || 'Nguyen Thanh Lam';
  const title = profile?.title || t('hero.build');

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col gap-24 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="min-h-[80vh] flex flex-col justify-center items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-primary font-mono mb-4 text-lg">{t('hero.hi')}</h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4">
            {name}.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-500 dark:text-slate-400 mb-8 max-w-3xl">
            {title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-600 dark:text-slate-400 max-w-xl text-lg mb-12 leading-relaxed">
            {profile?.about || t('hero.build')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-4"
        >
          <a href="#projects" className="px-8 py-4 bg-primary text-slate-900 rounded hover:bg-primary/90 transition-all font-bold">
            {t('hero.cta')}
          </a>
          
          {profile?.cv_url && (
            <a 
              href={profile.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border border-primary text-primary rounded hover:bg-primary/10 transition-all font-bold flex items-center gap-2"
            >
              <FileText size={20} /> {t('nav.cv')}
            </a>
          )}
        </motion.div>
      </section>

      <AboutSection profile={profile} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <ContactSection profile={profile} />
    </div>
  );
}
