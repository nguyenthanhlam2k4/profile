import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getSkills, addSkill, updateSkill, deleteSkill, subscribeSkills } from '../../services/firebase';

export default function SkillsManager() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const unsubscribe = subscribeSkills(
      (data) => {
        setSkills(data || []);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to skills:', error);
        toast.error('Không thể kết nối danh sách kỹ năng.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, data);
        toast.success(t('admin.save_success') || 'Đã cập nhật kỹ năng');
      } else {
        await addSkill(data);
        toast.success(t('admin.save_success') || 'Đã thêm kỹ năng mới');
      }
      setShowModal(false);
      reset();
      setEditingSkill(null);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    reset(skill);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill group?')) {
      try {
        await deleteSkill(id);
        toast.success(t('admin.delete_success') || 'Đã xóa kỹ năng');
      } catch (error) {
        toast.error('Failed to delete skill');
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
        <h2 className="text-2xl font-bold text-slate-200">{t('admin.skills')}</h2>
        <button 
          onClick={() => {
            setEditingSkill(null);
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
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.category_name')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.skill_list')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-xs">{skill.order || 0}</td>
                  <td className="p-4 text-slate-200 font-medium">{skill.category}</td>
                  <td className="p-4 text-slate-400 text-sm">{skill.items}</td>
                  <td className="p-4 flex justify-end gap-3">
                    <button 
                      onClick={() => handleEdit(skill)}
                      className="text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(skill.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {skills.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">{t('admin.no_data')}</td>
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
                {editingSkill ? t('admin.edit') : t('admin.add')}
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.category_name')}</label>
                  <input
                    {...register('category', { required: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ví dụ: Frontend, Backend..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.skill_list')}</label>
                <textarea
                  {...register('items', { required: true })}
                  rows="4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="React, Next.js, Tailwind..."
                ></textarea>
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
                  {editingSkill ? t('admin.save') : t('admin.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
