import React, { useEffect, useState } from 'react';
import { Save, Loader2, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getProfile, updateProfile } from '../../services/firebase';
import { uploadImage } from '../../services/cloudinary';

export default function ProfileManager() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const profileImage = watch('avatar');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (data) {

          reset(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setValue('avatar', imageUrl);
      toast.success(t('admin.upload_success') || 'Tải ảnh thành công');
    } catch (error) {
      toast.error(t('admin.upload_failed') || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateProfile(data);
      toast.success(t('admin.save_success') || 'Đã lưu thay đổi!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('admin.save_failed') || 'Lưu thất bại');
    } finally {
      setSaving(false);
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
        <h2 className="text-2xl font-bold text-slate-200">{t('admin.profile')}</h2>
        <button 
          onClick={handleSubmit(onSubmit)}
          disabled={saving || uploading}
          className="bg-primary text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('admin.saving')}
            </>
          ) : (
            <>
              <Save size={18} /> {t('admin.save')}
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center sm:flex-row gap-6 border-b border-slate-800 pb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-950">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Camera size={40} />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-slate-950 p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-medium text-slate-200 mb-1">{t('admin.image')}</h3>
              <p className="text-sm text-slate-400 mb-2">{t('admin.upload_desc') || 'Tải lên ảnh chân dung chuyên nghiệp.'}</p>
              <input type="hidden" {...register('avatar')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.name')}</label>
              <input
                {...register('name', { required: true })}
                type="text"
                placeholder="Nguyen Thanh Lam"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.pro_title')}</label>
              <input
                {...register('title', { required: true })}
                type="text"
                placeholder="Fullstack Software Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.hometown')}</label>
              <input
                {...register('hometown')}
                type="text"
                placeholder="Da Nang, Viet Nam"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.education')}</label>
              <input
                {...register('education')}
                type="text"
                placeholder="University of Technology"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.email')}</label>
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="lam@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.phone')}</label>
              <input
                {...register('phone')}
                type="text"
                placeholder="+84 123 456 789"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.birthday')}</label>
            <input
              {...register('birthday')}
              type="text"
              placeholder="01/01/2004"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.cv_url')}</label>
            <input
              {...register('cv_url')}
              type="url"
              placeholder="https://drive.google.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.about')}</label>
            <textarea
              {...register('about', { required: true })}
              rows="5"
              placeholder="Tell something about yourself..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>


        </form>
      </div>
    </div>
  );
}
