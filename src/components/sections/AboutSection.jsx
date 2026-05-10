import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSocials } from '../../services/firebase';

export default function AboutSection({ profile }) {
  const { t } = useTranslation();
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    const fetchSocials = async () => {
      const data = await getSocials();
      setSocials(data);
    };
    fetchSocials();
  }, []);
  return (
    <section id="about" className="min-h-[50vh] py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
          <span className="text-primary font-mono text-xl">01.</span> {t('about.title')}
          <div className="h-px bg-slate-700 flex-grow max-w-xs ml-4"></div>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="text-slate-400 leading-relaxed space-y-4">
            <p>
              {profile?.about || "Hello! My name is Lam and I enjoy creating things that live on the internet. My interest in web development started back in 2018 when I decided to try editing custom Tumblr themes — turns out hacking together HTML & CSS taught me a lot about HTML & CSS!"}
            </p>

            <div className="pt-4 space-y-3">
              {profile?.hometown && (
                <p className="flex items-center gap-3 text-slate-300">
                  <span className="text-primary font-mono text-sm">{t('about.hometown')}:</span>
                  {profile.hometown}
                </p>
              )}
              {profile?.education && (
                <p className="flex items-center gap-3 text-slate-300">
                  <span className="text-primary font-mono text-sm">{t('about.education')}:</span>
                  {profile.education}
                </p>
              )}
              {socials.map((social) => (
                <p key={social.id} className="flex items-center gap-3 text-slate-300">
                  <span className="text-primary font-mono text-sm">{social.platform}:</span>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate max-w-xs">
                    {social.url}
                  </a>
                </p>
              ))}
            </div>
          </div>
          
          <div className="relative group max-w-xs mx-auto md:mx-0">
            <div className="absolute inset-0 border-2 border-primary translate-x-4 translate-y-4 rounded transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
            <div className="relative bg-slate-800 aspect-square rounded overflow-hidden">
              {profile?.gallery && profile.gallery.length > 0 ? (
                <GallerySlideshow images={profile.gallery} />
              ) : profile?.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full bg-slate-700 opacity-50 group-hover:opacity-0 transition-opacity flex items-center justify-center mix-blend-multiply">
                   <span className="text-slate-500">Image Placeholder</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function GallerySlideshow({ images }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="w-full h-full relative">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
        />
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-primary w-4' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
