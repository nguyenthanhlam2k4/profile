import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, SortDesc, SortAsc, Filter, X } from 'lucide-react';
import { getProfile } from '../services/firebase';

export default function Gallery() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [filterDate, setFilterDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

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

  const galleryItems = useMemo(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-24 px-6">
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
              <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
                {t('gallery.title')}
              </h1>
              <div className="h-1 w-20 bg-primary rounded"></div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4">
              {/* Sort Dropdown */}
              <div className="relative group">
                <label className="block text-xs font-mono text-slate-500 mb-1 ml-1">{t('admin.status')}</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300">
                  {sortBy === 'newest' ? <SortDesc size={18} /> : <SortAsc size={18} />}
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-sm"
                  >
                    <option value="newest" className="bg-slate-900">{t('gallery.sort_newest')}</option>
                    <option value="oldest" className="bg-slate-900">{t('gallery.sort_oldest')}</option>
                  </select>
                </div>
              </div>

              {/* Date Filter */}
              <div className="relative group">
                <label className="block text-xs font-mono text-slate-500 mb-1 ml-1">{t('gallery.filter_date')}</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300">
                  <Calendar size={18} />
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-sm [color-scheme:dark]"
                  />
                  {filterDate && (
                    <button onClick={() => setFilterDate('')} className="text-slate-500 hover:text-slate-300">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-slate-800 bg-slate-900 shadow-xl"
                onClick={() => setSelectedImage(item.url)}
              >
                <img 
                  src={item.url} 
                  alt={`Gallery ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-slate-950/80 p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Filter size={20} className="text-primary" />
                  </div>
                </div>
                {item.createdAt > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-slate-950/90 backdrop-blur px-3 py-2 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800">
            <Filter size={48} className="mb-4 opacity-20" />
            <p className="text-lg">{t('gallery.no_images')}</p>
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
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-8 right-8 text-white hover:text-primary transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
