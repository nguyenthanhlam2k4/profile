import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getProjects, addProject, updateProject, deleteProject, subscribeProjects } from '../../services/firebase';
import { uploadImage } from '../../services/cloudinary';

export default function ProjectsManager() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const currentImage = watch('image');

  useEffect(() => {
    const unsubscribe = subscribeProjects(
      (data) => {
        setProjects(data || []);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to projects:', error);
        toast.error('Không thể kết nối danh sách dự án.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setValue('image', imageUrl);
      setPreviewImage(imageUrl);
      toast.success(t('admin.upload_success') || 'Tải ảnh thành công');
    } catch (error) {
      toast.error(t('admin.upload_failed') || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
        toast.success(t('admin.save_success') || 'Đã cập nhật dự án');
      } else {
        await addProject(data);
        toast.success(t('admin.save_success') || 'Đã thêm dự án mới');
      }
      closeModal();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
    setEditingProject(null);
    setPreviewImage('');
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    reset(project);
    setPreviewImage(project.image || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        toast.success(t('admin.delete_success') || 'Đã xóa dự án');
      } catch (error) {
        toast.error('Failed to delete project');
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
        <h2 className="text-2xl font-bold text-slate-200">{t('admin.projects')}</h2>
        <button 
          onClick={() => {
            setEditingProject(null);
            reset({
              status: 'Published'
            });
            setPreviewImage('');
            setShowModal(true);
          }}
          className="bg-primary text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> {t('admin.add')}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 text-slate-400 font-medium text-sm w-16">{t('admin.order')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.image')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.project_title')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.tech_stack')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm">{t('admin.status')}</th>
                <th className="p-4 text-slate-400 font-medium text-sm text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-xs">{project.order || 0}</td>
                  <td className="p-4">
                    <img 
                      src={project.image || 'https://via.placeholder.com/150'} 
                      alt={project.title} 
                      className="w-12 h-12 rounded object-cover border border-slate-700"
                    />
                  </td>
                  <td className="p-4 text-slate-200 font-medium">{project.title}</td>
                  <td className="p-4 text-slate-400 text-sm">{project.techStack}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'Published' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {project.status === 'Published' ? t('admin.status_published') : t('admin.status_inprogress')}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-3">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">{t('admin.no_data')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingProject ? t('admin.edit') : t('admin.add')}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative w-full aspect-video bg-slate-950 rounded-lg border border-slate-800 overflow-hidden group">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <ImageIcon size={48} />
                      <p className="text-sm mt-2">{t('admin.no_image')}</p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                  {uploading ? t('admin.uploading') : t('admin.upload')}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <input type="hidden" {...register('image')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.project_title')}</label>
                  <input
                    {...register('title', { required: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="E-commerce Platform"
                  />
                </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.order')}</label>
                  <input
                    {...register('order', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.status')}</label>
                  <select
                    {...register('status')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Published">{t('admin.status_published')}</option>
                    <option value="In Progress">{t('admin.status_inprogress')}</option>
                  </select>
                </div>
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.tech_stack')}</label>
                <input
                  {...register('techStack', { required: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="React, Firebase, Tailwind"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.description')}</label>
                <textarea
                  {...register('description')}
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Mô tả về dự án..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.demo_link')}</label>
                  <input
                    {...register('link')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.github_link')}</label>
                  <input
                    {...register('github')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://github..."
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary text-slate-950 font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {editingProject ? t('admin.save') : t('admin.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
