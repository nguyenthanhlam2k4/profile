import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AboutSection({ profile, socials, gallery }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryItems = gallery && gallery.length > 0 ? gallery : (profile?.gallery || []);
  const previewItems = galleryItems.slice(0, 5); // Show up to 5 items in slider

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % previewItems.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + previewItems.length) % previewItems.length);
  };

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(timer);
  }, [previewItems.length]);

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
            <div className="relative w-full h-[180px] sm:h-[230px] md:h-[310px] flex items-center justify-center overflow-visible py-4">
              <AnimatePresence initial={false}>
                {previewItems.map((item, index) => {
                  const numItems = previewItems.length;
                  const isCenter = index === activeIndex;
                  const isLeft1 = index === (activeIndex - 1 + numItems) % numItems;
                  const isRight1 = index === (activeIndex + 1) % numItems;
                  const isLeft2 = index === (activeIndex - 2 + numItems) % numItems;
                  const isRight2 = index === (activeIndex + 2) % numItems;

                  // Show exactly 5 items
                  if (!isCenter && !isLeft1 && !isRight1 && !isLeft2 && !isRight2) return null;

                  let x = "-50%";
                  let scale = 0.7;
                  let zIndex = 10;
                  let opacity = 0.6;

                  if (isCenter) {
                    x = "-50%";
                    scale = 1;
                    zIndex = 50;
                    opacity = 1;
                  } else if (isLeft1) {
                    x = "-160%";
                    scale = 0.85;
                    zIndex = 40;
                    opacity = 0.9;
                  } else if (isRight1) {
                    x = "60%";
                    scale = 0.85;
                    zIndex = 40;
                    opacity = 0.9;
                  } else if (isLeft2) {
                    x = "-270%";
                    scale = 0.7;
                    zIndex = 30;
                    opacity = 0.7;
                  } else if (isRight2) {
                    x = "170%";
                    scale = 0.7;
                    zIndex = 30;
                    opacity = 0.7;
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: "-50%", scale: 0.5 }}
                      animate={{ x, scale, zIndex, opacity }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      className="absolute left-1/2 w-[120px] sm:w-[160px] md:w-[220px] aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl cursor-pointer bg-slate-900"
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
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Active Title Caption Box */}
            <motion.div 
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md px-8 py-2 rounded-full border border-slate-300/40 dark:border-slate-700/40 shadow-lg min-w-[120px] text-center mt-6 z-40"
            >
              <span className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                {typeof previewItems[activeIndex] === 'string'
                  ? 'Khoảnh khắc'
                  : (previewItems[activeIndex]?.title || 'Không có tiêu đề')}
              </span>
            </motion.div>

            {/* Dots Indicator */}
            <div className="flex gap-2 mt-4 z-40">
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
