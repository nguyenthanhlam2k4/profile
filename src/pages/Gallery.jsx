import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, SortDesc, SortAsc, Filter, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProfile } from '../services/firebase';

const PAGE_SIZE = 6;

export default function Gallery() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [filterDate, setFilterDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    window.scrollTo(0, 0);
  }, []);

  const allFilteredItems = useMemo(() => {
    if (!profile?.gallery) return [];

    let items = profile.gallery.map(item => 
      typeof item === 'string' ? { url: item, createdAt: 0 } : item
    );

    // Filter by date
    if (filterDate) {
      items = items.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        return itemDate === filterDate;
      });
    }

    // Sort
    items.sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      return a.createdAt - b.createdAt;
    });

    return items;
  }, [profile, sortBy, filterDate]);

  // Pagination Logic
  const totalPages = Math.ceil(allFilteredItems.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const galleryItems = allFilteredItems.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-mono text-sm mb-8 group"
          >
            <ArrowLeft size={16} /> {t('gallery.back')}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter">
                {t('gallery.title')}
              </h1>
              <div className="h-1.5 w-20 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4">
              <div className="relative group">
                <label className="block text-xs font-mono text-slate-500 mb-1 ml-1">{t('admin.status')}</label>
                <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-foreground shadow-sm">
                  {sortBy === 'newest' ? <SortDesc size={18} /> : <SortAsc size={18} />}
                  <select 
                    value={sortBy} 
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on sort
                    }}
                    className="bg-transparent outline-none cursor-pointer text-sm"
                  >
                    <option value="newest" className="bg-card">{t('gallery.sort_newest')}</option>
                    <option value="oldest" className="bg-card">{t('gallery.sort_oldest')}</option>
                  </select>
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-mono text-slate-500 mb-1 ml-1">{t('gallery.filter_date')}</label>
                <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-foreground shadow-sm">
                  <Calendar size={18} />
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on filter
                    }}
                    className={`bg-transparent outline-none cursor-pointer text-sm ${filterDate ? 'text-foreground' : 'text-slate-400'}`}
                  />
                  {filterDate && (
                    <button onClick={() => setFilterDate('')} className="text-slate-500 hover:text-primary transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Container with AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          {galleryItems.length > 0 ? (
            <motion.div 
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-border bg-card shadow-lg hover:shadow-2xl transition-all"
                    onClick={() => setSelectedImage(item.url)}
                  >
                    <img 
                      src={item.url} 
                      alt={`Gallery ${idx}`} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 border border-white/20">
                        <Plus size={24} className="text-white" />
                      </div>
                    </div>
                    {item.createdAt > 0 && (
                      <div className="absolute bottom-4 left-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="bg-card/90 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 border border-border shadow-lg">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-6 mt-16 pb-12">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 rounded-xl border border-border bg-card disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-foreground shadow-sm"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-12 h-12 rounded-xl border font-bold transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110'
                                : 'border-border bg-card text-slate-500 hover:border-primary/50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-xl border border-border bg-card disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-foreground shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    Page {currentPage} of {totalPages} • {allFilteredItems.length} Images Total
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <Filter size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">{t('gallery.no_images')}</p>
              {filterDate && (
                <button 
                  onClick={() => setFilterDate('')}
                  className="mt-4 text-primary hover:underline font-mono text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-8 right-8 text-white hover:text-primary transition-colors p-2 bg-white/5 rounded-full backdrop-blur-md"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
