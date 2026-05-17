import React, { useEffect, useState } from 'react';
import { Users, FolderKanban, Wrench, Eye, Loader2, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDashboardStats } from '../../services/firebase';

export default function Dashboard() {
  const { t } = useTranslation();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStatsData(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: t('admin.total_projects'), value: statsData?.totalProjects || '0', icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: t('admin.total_skills'), value: statsData?.totalSkills || '0', icon: Wrench, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: t('admin.profile_views'), value: statsData?.profileViews?.toLocaleString() || '0', icon: Eye, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: t('admin.messages'), value: statsData?.messages || '0', icon: Mail, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-4">
            <div className={`p-4 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-200">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">{t('admin.recent_activity')}</h3>
          <p className="text-slate-400 text-sm">{t('admin.welcome_back')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">{t('admin.quick_actions')}</h3>
          <div className="flex gap-4">
            <a href="/" target="_blank" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded transition-colors inline-block">{t('admin.view_live')}</a>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded transition-colors"
            >
              {t('admin.refresh_stats')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
