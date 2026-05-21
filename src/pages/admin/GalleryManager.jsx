import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Camera, Calendar, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, setHomeGalleryImage } from '../../services/firebase';
import { uploadImage } from '../../services/cloudinary';

export default function GalleryManager() {
  const { t } = useTranslation();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const imageUrl = watch('url');

  const fetchGallery = async () => {
    try {
      const data = await getGallery();
      setGallery(data);
    } catch (error) {
      toast.error('Failed to fetch gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Sort gallery by postedAt in descending order (newest first)
  const sortedGallery = useMemo(() => {
    const sorted = [...gallery].sort((a, b) => (b.postedAt || 0) - (a.postedAt || 0));
    return sorted;
  }, [gallery]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setValue('url', url);
      toast.success(t('admin.upload_success') || 'Tải ảnh thành công');
    } catch (error) {
      toast.error(t('admin.upload_failed') || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!data.url) {
      toast.error('Vui lòng tải lên một ảnh');
      return;
    }

    // Convert date string to timestamp for sorting
    const postedAtTime = data.postedAt ? new Date(data.postedAt).getTime() : Date.now();
    
    const payload = {
      title: data.title,
      url: data.url,
      postedAt: editingItem ? postedAtTime : Date.now(), // Always use current time for new images
    };

    try {
      if (editingItem) {
        await updateGalleryItem(editingItem.id, payload);
        toast.success(t('admin.save_success') || 'Đã cập nhật ảnh');
      } else {
        await addGalleryItem(payload);
        toast.success(t('admin.save_success') || 'Đã thêm ảnh mới');
      }
      setShowModal(false);
      reset();
      setEditingItem(null);
      fetchGallery();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    reset({
      title: item.title,
      url: item.url,
      postedAt: item.postedAt ? new Date(item.postedAt).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      try {
        await deleteGalleryItem(id);
        toast.success(t('admin.delete_success') || 'Đã xóa ảnh');
        fetchGallery();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  const handleSetHomeImage = async (id) => {
    try {
      await setHomeGalleryImage(id);
      toast.success('Đã chọn ảnh này làm ảnh trang chủ');
      fetchGallery();
    } catch (error) {
      toast.error('Lỗi khi thiết lập ảnh trang chủ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-200">Quản lý ảnh (Gallery)</h2>
        <button 
          onClick={() => {
            setEditingItem(null);
            reset({
              title: '',
              url: '',
              postedAt: new Date().toISOString().split('T')[0]
            });
            setShowModal(true);
          }}
          className="bg-primary text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> {t('admin.add')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group relative">
            <div className="absolute top-3 left-3 z-20">
              <label className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full cursor-pointer border border-white/10 hover:bg-slate-800 transition-colors shadow-lg">
                <input 
                  type="radio" 
                  name="homeImage" 
                  checked={item.isHome === true} 
                  onChange={() => handleSetHomeImage(item.id)}
                  className="w-4 h-4 text-primary bg-slate-800 border-slate-700 focus:ring-primary focus:ring-offset-slate-900 cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-200 uppercase tracking-wider">Hiện ngoài Home</span>
              </label>
            </div>
            <div className="relative aspect-square">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => handleEdit(item)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-slate-200 truncate">{item.title || 'Không có tiêu đề'}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {item.postedAt ? new Date(item.postedAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        ))}
        {sortedGallery.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
            <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
            <p>Chưa có ảnh nào trong thư viện.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Sửa ảnh' : 'Thêm ảnh mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              <div className="flex justify-center mb-6">
                <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-950 group">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                      <Camera size={32} className="mb-2" />
                      <span className="text-sm">Tải ảnh lên</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tiêu đề ảnh (Title)</label>
                <input
                  {...register('title', { required: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập tiêu đề..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Ngày đăng (Date)</label>
                <input
                  {...register('postedAt', { required: true })}
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary text-slate-950 font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {editingItem ? t('admin.save') : t('admin.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
