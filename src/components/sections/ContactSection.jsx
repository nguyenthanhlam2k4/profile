import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ContactSection({ profile }) {
  const { t } = useTranslation();
  const email = profile?.email || 'hello@example.com';

  return (
    <section id="contact" className="py-20 mb-20 text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-primary font-mono mb-4">{t('contact.next')}</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">{t('contact.title')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-10 leading-relaxed">
          {profile?.about?.substring(0, 100) || "I'm currently looking for new opportunities. My inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!"}
        </p>
        <a 
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=Contact from Portfolio&body=Hi Lam,%0D%0A%0D%0AI would like to connect with you regarding...`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-10 py-4 border border-primary text-primary hover:bg-primary/10 rounded transition-all font-medium group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" height="20" 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
            className="group-hover:translate-x-1 transition-transform"
          >
            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          {t('contact.button')}
        </a>
      </motion.div>
    </section>
  );
}
