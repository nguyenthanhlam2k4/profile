import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Send, 
  Loader2,
  MessageSquare
} from 'lucide-react';
import { sendMessage } from '../../services/firebase';
import toast from 'react-hot-toast';

// Custom Facebook SVG Component to avoid lucide-react export issues
const Facebook = ({ size = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// Custom Github SVG Component to avoid lucide-react export issues
const Github = ({ size = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Custom Linkedin SVG Component to avoid lucide-react export issues
const Linkedin = ({ size = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function ContactSection({ profile, socials }) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const isVi = i18n.language === 'vi';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(isVi ? 'Vui lòng điền đầy đủ các thông tin bắt buộc!' : 'Please fill in all required fields!');
      return;
    }

    setLoading(true);
    try {
      await sendMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'No Subject',
        message: formData.message
      });
      toast.success(isVi ? 'Gửi tin nhắn thành công! Cảm ơn bạn.' : 'Message sent successfully! Thank you.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(isVi ? 'Có lỗi xảy ra, vui lòng thử lại sau.' : 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('git')) return <Github size={20} />;
    if (p.includes('linkedin') || p.includes('link-in')) return <Linkedin size={20} />;
    if (p.includes('facebook') || p.includes('fb')) return <Facebook size={20} />;
    return <Globe size={20} />;
  };

  return (
    <section id="contact" className="py-20 relative">
      {/* Decorative Blur Spheres */}
      <div className="absolute right-[-10%] bottom-[-10%] w-[350px] aspect-square rounded-full bg-primary/10 blur-[80px] pointer-events-none z-0" />
      <div className="absolute left-[-5%] top-[20%] w-[250px] aspect-square rounded-full bg-fuchsia-500/5 blur-[60px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Section Heading */}
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 text-foreground">
          <span className="text-primary font-mono text-xl">04.</span> {t('contact.title')}
          <div className="h-px bg-border flex-grow max-w-xs ml-4"></div>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Socials */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-mono text-xs uppercase tracking-widest block">
                {t('contact.next')}
              </span>
              <h3 className="text-2xl font-black text-foreground">
                {isVi ? 'Hãy kết nối cùng nhau!' : "Let's create something together!"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                {isVi 
                  ? 'Tôi luôn sẵn sàng đón nhận những cơ hội hợp tác mới, các dự án thú vị, hoặc chỉ đơn thuần là một lời chào. Hãy gửi tin nhắn cho tôi nhé!'
                  : "I'm always open to new opportunities, collaboration on exciting projects, or simply having a casual chat. Feel free to reach out!"
                }
              </p>
            </div>

            {/* Direct Info List */}
            <div className="space-y-6">
              {profile?.email && (
                <a 
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 backdrop-blur-md transition-all hover:scale-[1.02] group"
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{isVi ? 'Email của tôi' : 'Email me'}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-foreground truncate">{profile.email}</p>
                  </div>
                </a>
              )}

              {profile?.phone && (
                <a 
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:border-fuchsia-500/30 dark:hover:border-fuchsia-500/30 backdrop-blur-md transition-all hover:scale-[1.02] group"
                >
                  <div className="p-3 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 group-hover:scale-110 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{isVi ? 'Điện thoại' : 'Call me'}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-foreground">{profile.phone}</p>
                  </div>
                </a>
              )}

              {profile?.hometown && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 backdrop-blur-md transition-all group">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{isVi ? 'Vị trí hiện tại' : 'Location'}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-foreground">{profile.hometown}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Icons Link List */}
            {socials && socials.length > 0 && (
              <div className="space-y-4 pt-4">
                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{isVi ? 'Mạng xã hội' : 'Follow me'}</p>
                <div className="flex flex-wrap gap-4">
                  {socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary/40 dark:hover:border-primary/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] flex items-center justify-center"
                      title={social.platform}
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form 
              onSubmit={handleSubmit}
              className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/20 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative light reflection on card */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {isVi ? 'Họ và tên *' : 'Full Name *'}
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={isVi ? 'Nhập họ và tên...' : 'Enter your name...'}
                      required
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {isVi ? 'Địa chỉ Email *' : 'Email Address *'}
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Subject field */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {isVi ? 'Tiêu đề' : 'Subject'}
                  </label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={isVi ? 'Tiêu đề tin nhắn...' : 'What is this regarding?...'}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Message field */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {isVi ? 'Lời nhắn *' : 'Message *'}
                  </label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder={isVi ? 'Nhập lời nhắn của bạn ở đây...' : 'Write your message here...'}
                    required
                    className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group py-4 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{isVi ? 'Đang gửi...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('contact.button')}</span>
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
