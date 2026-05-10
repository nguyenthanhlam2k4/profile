import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProjectsSection({ projects: dynamicProjects }) {
  const { t } = useTranslation();
  const defaultProjects = [
    {
      title: 'E-commerce Platform',
      description: 'A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product management, cart functionality, and Stripe payment integration.',
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
      github: '#',
      live: '#',
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Task Management Dashboard',
      description: 'A responsive task management dashboard that helps teams organize their workflows. Includes drag-and-drop functionality, real-time updates, and comprehensive analytics.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase'],
      github: '#',
      live: '#',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Weather App',
      description: 'A sleek, minimalist weather application that provides real-time forecasts and historical weather data using external APIs. Features smooth animations and location-based detection.',
      techStack: ['React', 'Framer Motion', 'OpenWeather API'],
      github: '#',
      live: '#',
      image: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  const displayProjects = (dynamicProjects?.length > 0 
    ? [...dynamicProjects].sort((a, b) => (a.order || 0) - (b.order || 0))
    : defaultProjects
  ).map(p => ({
        ...p,
        techStack: typeof p.techStack === 'string' ? p.techStack.split(',').map(t => t.trim()) : p.techStack,
        image: p.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }));

  return (
    <section id="projects" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
          <span className="text-primary font-mono text-xl">03.</span> {t('projects.title')}
          <div className="h-px bg-slate-700 flex-grow max-w-xs ml-4"></div>
        </h2>

        <div className="space-y-24">
          {displayProjects.map((project, index) => (
            <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              {/* Project Image */}
              <div className="w-full md:w-3/5 relative group">
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-300 rounded-lg z-10"></div>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-auto aspect-video object-cover rounded-lg filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>

              {/* Project Content */}
              <div className={`w-full md:w-2/5 flex flex-col ${index % 2 === 1 ? 'md:items-start text-left' : 'md:items-end md:text-right'} relative z-20`}>
                <p className="text-primary font-mono text-sm mb-2">{t('projects.featured')}</p>
                <h3 className="text-2xl font-bold text-slate-200 mb-6">{project.title}</h3>
                
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-xl mb-6 relative z-30 w-full md:w-[120%] md:-ml-[20%]">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <ul className={`flex flex-wrap gap-4 text-slate-400 font-mono text-sm mb-6 ${index % 2 === 1 ? 'justify-start' : 'justify-start md:justify-end'}`}>
                  {project.techStack.map((tech, i) => (
                    <li key={i}>{tech}</li>
                  ))}
                </ul>

                <div className="flex gap-4">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                      <GitBranch size={20} />
                    </a>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
