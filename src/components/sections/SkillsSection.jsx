import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function SkillsSection({ skills: dynamicSkills }) {
  const { t } = useTranslation();
  const defaultSkills = [
    { category: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'Python', 'Django', 'REST APIs'] },
    { category: 'Database & Cloud', items: ['MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Google Cloud'] },
    { category: 'Tools', items: ['Git', 'Docker', 'Webpack', 'Figma', 'Jest'] },
  ];

  const displaySkills = (dynamicSkills?.length > 0 
    ? [...dynamicSkills].sort((a, b) => (a.order || 0) - (b.order || 0))
    : defaultSkills
  ).map(s => ({
        category: s.category,
        items: typeof s.items === 'string' ? s.items.split(',').map(i => i.trim()) : s.items
      }));

  return (
    <section id="skills" className="min-h-[50vh] py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
          <span className="text-primary font-mono text-xl">02.</span> {t('skills.title')}
          <div className="h-px bg-slate-700 flex-grow max-w-xs ml-4"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displaySkills.map((skillGroup, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-4 text-slate-200">{skillGroup.category}</h3>
              <ul className="space-y-2">
                {skillGroup.items.map((skill, i) => (
                  <li key={i} className="text-slate-400 flex items-center gap-2">
                    <span className="text-primary text-xs">▹</span> {skill}
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
