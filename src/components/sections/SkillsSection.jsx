import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Layout, Server, Database, Cpu, CheckCircle2 } from 'lucide-react';

export default function SkillsSection({ skills }) {
  const { t } = useTranslation();
  
  const defaultSkills = [
    {
      category: 'Frontend',
      icon: <Layout className="text-primary" size={24} />,
      items: ['ReactJS', 'HTML', 'CSS', 'JavaScript', 'Tailwind CSS']
    },
    {
      category: 'Backend',
      icon: <Server className="text-fuchsia-500" size={24} />,
      items: ['Node.js (Express)', 'RESTful API', 'JWT Auth']
    },
    {
      category: 'Database',
      icon: <Database className="text-emerald-500" size={24} />,
      items: ['MongoDB', 'Firebase', 'MySQL']
    },
    {
      category: 'Tools & Others',
      icon: <Cpu className="text-orange-500" size={24} />,
      items: ['Git', 'Docker', 'Vercel', 'Netlify']
    }
  ];

  const displaySkills = skills?.length > 0 
    ? skills.map(group => ({
        ...group,
        icon: group.category.toLowerCase().includes('front') ? <Layout className="text-primary" size={24} /> :
              group.category.toLowerCase().includes('back') ? <Server className="text-fuchsia-500" size={24} /> :
              group.category.toLowerCase().includes('data') ? <Database className="text-emerald-500" size={24} /> :
              <Cpu className="text-orange-500" size={24} />,
        items: typeof group.items === 'string' ? group.items.split(',').map(s => s.trim()) : group.items
      }))
    : defaultSkills;

  return (
    <section id="skills" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
          <span className="text-primary font-mono text-xl">02.</span> {t('skills.title')}
          <div className="h-px bg-border flex-grow max-w-xs ml-4"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displaySkills.map((skillGroup, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                  {skillGroup.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {skillGroup.category}
                </h3>
              </div>
              
              <ul className="space-y-3">
                {skillGroup.items.map((skill, i) => (
                  <li key={i} className="text-slate-600 dark:text-slate-400 flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={14} className="text-primary/70" />
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
