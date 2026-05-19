import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowRight } from 'lucide-react';
import AboutSection from '../components/sections/AboutSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import { getProfile, getProjects, getSkills, getSocials, getGallery, incrementViews, subscribeGallery, subscribeProfile, subscribeProjects, subscribeSkills } from '../services/firebase';

// ── Skeleton Components ──────────────────────────────────────────────────────
const Shimmer = ({ className }) => (
  <div className={`relative overflow-hidden rounded-xl bg-slate-200/10 dark:bg-slate-800/40 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
  </div>
);

const HeroSkeleton = () => (
  <section className="min-h-[90vh] flex items-center">
    <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
      <div className="flex-1 flex flex-col gap-6 w-full">
        <Shimmer className="h-6 w-40 rounded-full" />
        <Shimmer className="h-24 w-full max-w-lg" />
        <Shimmer className="h-8 w-72" />
        <Shimmer className="h-5 w-full max-w-md" />
        <Shimmer className="h-5 w-3/4 max-w-sm" />
        <div className="flex gap-4 mt-4">
          <Shimmer className="h-12 w-40 rounded-full" />
          <Shimmer className="h-12 w-36 rounded-full" />
        </div>
      </div>
      <div className="flex-1 flex justify-center lg:justify-end">
        <Shimmer className="w-72 h-72 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] rounded-3xl" />
      </div>
    </div>
  </section>
);

const AboutSkeleton = () => (
  <section className="py-20">
    <Shimmer className="h-9 w-52 mb-12" />
    <div className="max-w-4xl mx-auto space-y-16">
      <Shimmer className="h-28 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <Shimmer key={i} className="h-7" />)}
      </div>
      <Shimmer className="h-[380px] w-full rounded-2xl" />
    </div>
  </section>
);

const SkillsSkeleton = () => (
  <section className="py-20">
    <Shimmer className="h-9 w-48 mb-12" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => <Shimmer key={i} className="h-52 rounded-2xl" />)}
    </div>
  </section>
);

const ProjectsSkeleton = () => (
  <section className="py-20">
    <Shimmer className="h-9 w-56 mb-12" />
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-48 rounded-2xl" />)}
    </div>
  </section>
);

const ContactSkeleton = () => (
  <section className="py-20">
    <Shimmer className="h-9 w-44 mb-12" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-6">
        <Shimmer className="h-6 w-32" />
        <Shimmer className="h-10 w-full" />
        <Shimmer className="h-20 w-full" />
        <Shimmer className="h-16 w-full rounded-2xl" />
        <Shimmer className="h-16 w-full rounded-2xl" />
      </div>
      <div className="lg:col-span-7">
        <Shimmer className="h-[400px] w-full rounded-3xl" />
      </div>
    </div>
  </section>
);

export default function Home() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [socials, setSocials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Static/One-time operations (Views count & Socials fetch)
    const initStaticData = async () => {
      try {
        const socialsData = await getSocials();
        setSocials(socialsData || []);

        const hasCounted = sessionStorage.getItem('hasCountedView');
        if (!hasCounted) {
          await incrementViews();
          sessionStorage.setItem('hasCountedView', 'true');
        }
      } catch (error) {
        console.error('Error in static data init:', error);
      }
    };
    initStaticData();

    // 2. Real-time Subscriptions
    const unsubProfile = subscribeProfile(
      (data) => {
        if (data) setProfile(data);
      },
      (err) => console.error('Profile sync error:', err)
    );

    const unsubProjects = subscribeProjects(
      (data) => {
        setProjects(data || []);
        setLoading(false);
      },
      (err) => {
        console.error('Projects sync error:', err);
        setLoading(false);
      }
    );

    const unsubSkills = subscribeSkills(
      (data) => {
        setSkills(data || []);
      },
      (err) => console.error('Skills sync error:', err)
    );

    return () => {
      unsubProfile();
      unsubProjects();
      unsubSkills();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeGallery(
      (data) => {
        setGallery(data || []);
      },
      (error) => {
        console.error('Error in gallery real-time feed:', error);
      }
    );
    return unsubscribe;
  }, []);

  const name = t('hero.name').toUpperCase();
  const title = profile?.title || t('hero.build');

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="container mx-auto px-6 py-12 flex flex-col gap-32 max-w-6xl relative z-10">
          <HeroSkeleton />
          <AboutSkeleton />
          <SkillsSkeleton />
          <ProjectsSkeleton />
          <ContactSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-6 py-12 flex flex-col gap-32 max-w-6xl relative z-10">
        {/* Hero Section */}
        <section id="hero" className="min-h-[90vh] flex items-center relative">
          <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Column: Text Content */}
            <div className="flex-1 flex flex-col justify-center z-10 w-full">
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
                <h1 className="text-5xl sm:text-6xl md:text-[80px] lg:text-[100px] font-black tracking-tighter text-foreground mb-6 leading-[0.9] drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
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
                <p className="text-xl md:text-3xl font-bold text-slate-600 dark:text-slate-400 mb-8 max-w-2xl leading-snug">
                  {title}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                <p className="text-slate-500 dark:text-slate-500 max-w-xl text-lg mb-12 leading-relaxed font-medium">
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
                  className="group relative px-8 py-3 bg-white text-slate-950 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {t('hero.cta')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                
                {profile?.cv_url && (
                  <a 
                    href={profile.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <FileText size={20} /> {t('nav.cv')}
                  </a>
                )}
              </motion.div>
            </div>

            {/* Right Column: Animated Image from Gallery */}
            {gallery && gallery.length > 0 && (() => {
              const homeImage = gallery.find(item => item.isHome) || gallery[0];
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="flex-1 w-full flex justify-center lg:justify-end relative"
                >
                  <motion.div
                    animate={{ 
                      y: [-10, 10, -10],
                      rotate: [-2, 2, -2]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10 group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
                    <img 
                      src={homeImage.url} 
                      alt={homeImage.title || "Latest capture"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </motion.div>
                  
                  {/* Decorative background blur */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[500px] max-h-[500px] bg-primary/20 blur-[100px] rounded-full z-0 pointer-events-none animate-pulse"></div>
                </motion.div>
              );
            })()}
          </div>
        </section>

        <AboutSection profile={profile} socials={socials} gallery={gallery} />
        <SkillsSection skills={skills} />
        <ProjectsSection projects={projects} limit={3} />
        <ContactSection profile={profile} socials={socials} />
      </div>
    </div>
  );
}
