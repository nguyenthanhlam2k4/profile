import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getSocials, addSocial, updateSocial, deleteSocial } from '../../services/firebase';

export default function SocialsManager() {
  const { t } = useTranslation();
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchSocials = async () => {
    try {
      const data = await getSocials();
      const sortedData = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSocials(sortedData);
    } catch (error) {
      toast.error('Failed to fetch socials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingSocial) {
        await updateSocial(editingSocial.id, data);
        toast.success(t('admin.save_success') || 'Đã cập nhật mạng xã hội');
      } else {
        await addSocial(data);
        toast.success(t('admin.save_success') || 'Đã thêm mạng xã hội mới');
      }
      setShowModal(false);
      reset();
      setEditingSocial(null);
      fetchSocials();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (social) => {
    setEditingSocial(social);
    reset(social);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mạng xã hội này?')) {
      try {
        await deleteSocial(id);
        toast.success(t('admin.delete_success') || 'Đã xóa mạng xã hội');
        fetchSocials();
      } catch (error) {
        console.error('Error deleting social link:', error);
        toast.error('Không thể xóa mạng xã hội. Vui lòng kiểm tra lại quyền hoặc kết nối.');
      }
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
        <h2 className="text-2xl font-bold text-slate-200">Quản lý mạng xã hội</h2>
        <button 
          onClick={() => {
            setEditingSocial(null);
            reset();
            setShowModal(true);
          }}
          className="bg-primary text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> {t('admin.add')}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 text-slate-400 font-medium text-sm w-16">{t('admin.order')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.platform')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.url')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {socials.map((social) => (
                <tr key={social.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-xs">{social.order || 0}</td>
                  <td className="p-4 text-slate-200 font-medium flex items-center gap-2">
                    <LinkIcon size={16} className="text-primary" />
                    {social.platform}
                  </td>
                  <td className="p-4 text-slate-400 text-sm truncate max-w-xs">{social.url}</td>
                  <td className="p-4 flex justify-end gap-3">
                    <button 
                      onClick={() => handleEdit(social)}
                      className="text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(social.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {socials.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">Chưa có mạng xã hội nào được thêm.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingSocial ? 'Chỉnh sửa mạng xã hội' : 'Thêm mạng xã hội mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.order')}</label>
                  <input
                    {...register('order', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.platform')}</label>
                  <input
                    {...register('platform', { required: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ví dụ: Facebook, GitHub, Instagram..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.url')}</label>
                <input
                  {...register('url', { required: true })}
                  type="url"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
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
                  className="flex-1 px-4 py-2 bg-primary text-slate-950 font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingSocial ? t('admin.save') : t('admin.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
