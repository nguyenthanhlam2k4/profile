import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
              
              {profile?.email && (
                <p className="flex items-center gap-3 text-slate-300">
                  <span className="text-primary font-mono text-sm">Email:</span>
                  <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                    {profile.email}
                  </a>
                </p>
              )}
              {profile?.phone && (
                <p className="flex items-center gap-3 text-slate-300">
                  <span className="text-primary font-mono text-sm">{t('about.phone')}:</span>
                  <a href={`tel:${profile.phone}`} className="hover:text-primary transition-colors">
                    {profile.phone}
                  </a>
                </p>
              )}
              {profile?.birthday && (
                <p className="flex items-center gap-3 text-slate-300">
                  <span className="text-primary font-mono text-sm">{t('about.birthday')}:</span>
                  {profile.birthday}
                </p>
              )}
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
          
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              {profile?.gallery && profile.gallery.length > 0 ? (
                <GallerySlideshow 
                  images={profile.gallery
                    .map(item => typeof item === 'string' ? { url: item, createdAt: 0 } : item)
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 3)
                    .map(item => item.url)
                  } 
                />
              ) : profile?.avatar ? (
                <div className="w-2/3 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src={profile.avatar} 
                    alt={t('hero.name')} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-2/3 aspect-[3/4] bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 shadow-2xl">
                   <span>No Image</span>
                </div>
              )}
            </div>
            
            {profile?.gallery && profile.gallery.length > 0 && (
              <div className="mt-16">
                <Link 
                  to="/gallery" 
                  className="px-8 py-2 border border-slate-700 text-slate-400 rounded hover:bg-slate-800 transition-all font-sans text-lg"
                >
                  {t('gallery.view_all')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function GallerySlideshow({ images }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const getPosition = (i) => {
    let diff = i - index;
    if (diff < -Math.floor(images.length / 2)) diff += images.length;
    if (diff > Math.floor(images.length / 2)) diff -= images.length;
    return diff;
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-visible">
      <div className="relative w-[70%] aspect-[3/4] flex items-center justify-center">
        {images.map((img, i) => {
          const pos = getPosition(i);
          const isActive = pos === 0;
          const isVisible = Math.abs(pos) <= 1;
          
          return (
            <motion.div
              key={i}
              className="absolute w-full h-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer"
              initial={false}
              animate={{
                x: pos * 40,
                scale: isActive ? 1 : 0.85,
                zIndex: isActive ? 10 : 5 - Math.abs(pos),
                opacity: isVisible ? (isActive ? 1 : 0.6) : 0,
                filter: isActive ? 'blur(0px)' : 'blur(1px)',
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20 
              }}
              onClick={() => setIndex(i)}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.div>
          );
        })}
      </div>
      
      {/* Pagination Dots */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {images.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? 'bg-slate-200 scale-125' : 'bg-slate-600'}`}
          />
        ))}
      </div>
    </div>
  );
}
