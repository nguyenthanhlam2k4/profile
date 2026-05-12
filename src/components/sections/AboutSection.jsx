import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function AboutSection({ profile, socials }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryItems = profile?.gallery || [];
  const previewItems = galleryItems.slice(0, 5); // Show up to 5 items in slider

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % previewItems.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + previewItems.length) % previewItems.length);
  };

  return (
    <section id="about" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 text-foreground">
          <span className="text-primary font-mono text-xl">01.</span> {t('about.title')}
          <div className="h-px bg-border flex-grow max-w-xs ml-4"></div>
        </h2>
        
        {/* Main Content Area - Single Column Stacked */}
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Top: Introduction Text */}
          <div className="bg-primary/[0.03] dark:bg-white/[0.03] p-8 rounded-3xl border border-border italic relative group">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 rounded-l-3xl"></div>
            <p className="text-foreground text-lg md:text-xl leading-relaxed">
              "{profile?.about || "Aspiring Fullstack Developer aiming to build scalable and user-friendly web applications, while continuously enhancing technical skills and contributing to the development of high-quality products."}"
            </p>
          </div>

          {/* Middle: Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-lg">
            {profile?.email && (
              <div className="flex items-baseline gap-4">
                <span className="text-sky-400 font-medium w-28 shrink-0">Email:</span>
                <a href={`mailto:${profile.email}`} className="text-foreground hover:text-primary transition-colors truncate">
                  {profile.email}
                </a>
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-baseline gap-4">
                <span className="text-sky-400 font-medium w-28 shrink-0">{t('about.phone') || "Phone"}:</span>
                <a href={`tel:${profile.phone}`} className="text-foreground hover:text-primary transition-colors">
                  {profile.phone}
                </a>
              </div>
            )}
            {profile?.birthday && (
              <div className="flex items-baseline gap-4">
                <span className="text-sky-400 font-medium w-28 shrink-0">{t('about.birthday') || "Date of Birth"}:</span>
                <span className="text-foreground">{profile.birthday}</span>
              </div>
            )}
            {profile?.hometown && (
              <div className="flex items-baseline gap-4">
                <span className="text-sky-400 font-medium w-28 shrink-0">{t('about.hometown') || "Hometown"}:</span>
                <span className="text-foreground">{profile.hometown}</span>
              </div>
            )}
            {profile?.education && (
              <div className="flex items-baseline gap-4">
                <span className="text-sky-400 font-medium w-28 shrink-0">{t('about.education') || "Education"}:</span>
                <span className="text-foreground">{profile.education}</span>
              </div>
            )}
            {socials?.map((social) => (
              <div key={social.id} className="flex items-baseline gap-4">
                <span className="text-sky-400 font-medium w-28 shrink-0">{social.platform}:</span>
                <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-foreground font-bold hover:text-primary transition-colors truncate">
                  {social.url}
                </a>
              </div>
            ))}
          </div>

          {/* Bottom: 3D Stacked Slider & All View Button */}
          <div className="flex flex-col items-center pt-8 border-t border-border/50">
            <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden py-10">
              <AnimatePresence initial={false}>
                {previewItems.map((item, index) => {
                  const isCenter = index === activeIndex;
                  const isLeft = index === (activeIndex - 1 + previewItems.length) % previewItems.length;
                  const isRight = index === (activeIndex + 1) % previewItems.length;

                  if (!isCenter && !isLeft && !isRight) return null;

                  let x = 0;
                  let scale = 0.8;
                  let zIndex = 10;
                  let opacity = 0.3;
                  let rotate = 0;

                  if (isCenter) {
                    x = 0;
                    scale = 1;
                    zIndex = 30;
                    opacity = 1;
                  } else if (isLeft) {
                    x = -100;
                    scale = 0.85;
                    zIndex = 20;
                    rotate = -5;
                  } else if (isRight) {
                    x = 100;
                    scale = 0.85;
                    zIndex = 20;
                    rotate = 5;
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 0, scale: 0.5 }}
                      animate={{ x, scale, zIndex, opacity, rotate }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute w-[240px] md:w-[300px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 cursor-pointer"
                      onClick={() => setActiveIndex(index)}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, { offset }) => {
                        if (offset.x > 50) prevSlide();
                        else if (offset.x < -50) nextSlide();
                      }}
                    >
                      <img 
                        src={typeof item === 'string' ? item : item.url} 
                        alt="Gallery" 
                        className="w-full h-full object-cover"
                      />
                      {isCenter && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                          <div className="w-12 h-1.5 bg-primary rounded-full"></div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Dots Indicator inside the slider area */}
              <div className="absolute bottom-4 flex gap-2 z-40">
                {previewItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "w-8 bg-primary" : "w-1.5 bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* All View Button */}
            <Link 
              to="/gallery" 
              className="mt-8 px-12 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-2xl text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary transition-all font-bold text-sm flex items-center gap-2 group shadow-xl"
            >
              {t('All view') || "All view"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
