import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  Trash2,
  Zap,
  Navigation,
} from 'lucide-react';
import { getAIResponse } from '../services/ai';
import { getProfile, getSkills, getProjects } from '../services/firebase';

// ── Markdown Renderer ─────────────────────────────────────────────────────────
function MarkdownText({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  let keyCounter = 0; // key duy nhất, không phụ thuộc vào i

  while (i < lines.length) {
    const line = lines[i];

    // Danh sách gạch đầu dòng
    if (line.trimStart().startsWith('- ') || line.trimStart().startsWith('* ')) {
      const listItems = [];
      const listKey = `ul-${keyCounter++}`;
      while (
        i < lines.length &&
        (lines[i].trimStart().startsWith('- ') || lines[i].trimStart().startsWith('* '))
      ) {
        listItems.push(lines[i].replace(/^[\s]*[-*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={listKey} className="list-disc list-inside space-y-0.5 my-1">
          {listItems.map((item, idx) => (
            <li key={`${listKey}-${idx}`} className="text-sm">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Dòng trống
    if (line.trim() === '') {
      elements.push(<div key={`gap-${keyCounter++}`} className="h-1" />);
    } else {
      elements.push(
        <p key={`p-${keyCounter++}`} className="text-sm leading-relaxed">
          <InlineMarkdown text={line} />
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// Xử lý markdown inline: **bold**, *italic*, `code`
function InlineMarkdown({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={idx} className="italic text-slate-300">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={idx} className="px-1 py-0.5 bg-slate-700 rounded text-xs font-mono text-indigo-300">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

// ── Suggestion Chips ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Lâm có kỹ năng gì nổi bật?',
  'Kể về các dự án của Lâm',
  'Lâm có kinh nghiệm làm việc chưa?',
  'Liên hệ Lâm như thế nào?',
];

// ── Chatbot Component ─────────────────────────────────────────────────────────
export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [navToast, setNavToast] = useState(null); // { label, path }
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Chào bạn! Mình là trợ lý AI của **Lâm** 👋\nBạn muốn biết gì về Lâm? Chọn gợi ý bên dưới hoặc tự đặt câu hỏi nhé!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, skills, projects] = await Promise.all([
          getProfile(),
          getSkills(),
          getProjects(),
        ]);
        setContextData({ profile, skills, projects });
      } catch (error) {
        console.error('Error fetching context for AI:', error);
      }
    };
    fetchData();
  }, []);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Parse & execute navigation tag ─────────────────────────────────────────
  const NAV_LABELS = {
    '/projects': '📂 Trang Dự Án',
    '/gallery':  '🖼️ Thư Viện Ảnh',
    '/':         '🏠 Trang Chủ',
    '/#about':   '👤 Mục Giới Thiệu',
    '/#skills':  '💻 Mục Kỹ Năng',
    '/#contact': '📬 Mục Liên Hệ',
  };

  const executeNav = (path) => {
    const label = NAV_LABELS[path] || path;
    setNavToast({ label, path });
    setTimeout(() => setNavToast(null), 3000);

    if (path.includes('#')) {
      // Hash navigation — về home trước rồi scroll
      const [route, hash] = path.split('#');
      navigate(route || '/');
      setTimeout(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      navigate(path);
    }
  };

  const NAV_REGEX = /\[NAV:([^\]]+)\]/;

  const parseResponse = (rawText) => {
    const match = rawText.match(NAV_REGEX);
    if (match) {
      const path = match[1].trim();
      const cleanText = rawText.replace(NAV_REGEX, '').trimEnd();
      return { text: cleanText, navPath: path };
    }
    return { text: rawText, navPath: null };
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
    setInput('');
    setShowSuggestions(false); // Ẩn gợi ý sau khi gửi tin đầu tiên

    const prevMessages = [...messages];
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const rawResponse = await getAIResponse(text, contextData, prevMessages);
      const { text: cleanText, navPath } = parseResponse(rawResponse);
      setMessages((prev) => [...prev, { role: 'ai', text: cleanText }]);
      if (navPath) {
        setTimeout(() => executeNav(navPath), 600); // nhỏ delay để user đọc response trước
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Xin lỗi, mình gặp chút trục trặc. Bạn thử lại sau nhé!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'ai',
        text: 'Chào bạn! Mình là trợ lý AI của **Lâm** 👋\nBạn muốn biết gì về Lâm? Chọn gợi ý bên dưới hoặc tự đặt câu hỏi nhé!',
      },
    ]);
    setShowSuggestions(true);
    setInput('');
  };

  const msgCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* ── Nav Toast ── */}
      <AnimatePresence>
        {navToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-20 right-0 flex items-center gap-2 bg-slate-800 border border-indigo-500/30 text-slate-200 text-xs px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap"
          >
            <Navigation size={13} className="text-indigo-400 shrink-0" />
            <span>Đang chuyển đến <strong className="text-indigo-300">{navToast.label}</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle Button ── */}
      <AnimatePresence>

        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle size={28} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`
              fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6
              ${isFull ? 'top-4 md:top-auto md:w-[420px] md:h-[680px]' : 'w-auto md:w-[370px] h-[560px] max-h-[85vh]'}
              bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden
              transition-all duration-300 ease-in-out z-[9999]
            `}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-500/20 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 relative">
                  <Bot size={20} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    Lam&apos;s AI <Sparkles size={12} className="text-yellow-400" />
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">Powered by Gemini 2.5 Flash</span>
                    {msgCount > 0 && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Zap size={8} className="text-indigo-400" />
                          {msgCount} tin nhắn
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Xóa cuộc trò chuyện"
                  className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-slate-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => setIsFull(!isFull)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors hidden md:block"
                >
                  {isFull ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-slate-400 transition-all"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-2`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mb-1 shadow-sm">
                      <Bot size={13} />
                    </div>
                  )}
                  <div
                    className={`
                      max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-sm
                      ${msg.role === 'ai'
                        ? 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-white/5'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm text-sm leading-relaxed'}
                    `}
                  >
                    {msg.role === 'ai' ? (
                      <MarkdownText text={msg.text} />
                    ) : (
                      <span className="text-sm">{msg.text}</span>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-end gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Bot size={13} />
                  </div>
                  <div className="bg-slate-800/80 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Suggestion Chips — chỉ hiện khi chưa có tin nhắn từ user */}
              {showSuggestions && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/40 transition-all font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-slate-900/60 border-t border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                  placeholder="Nhập câu hỏi..."
                  disabled={loading}
                  className="flex-1 bg-slate-800/60 border border-white/10 text-slate-200 px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm placeholder:text-slate-500 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className={`
                    w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all
                    ${input.trim() && !loading
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                  `}
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-600 mt-2 font-mono tracking-wider">
                GEMINI 2.5 FLASH · LAM&apos;S AI ASSISTANT
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
