import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Maximize2, 
  Minimize2,
  Sparkles
} from 'lucide-react';
import { getAIResponse } from '../services/ai';
import { getProfile, getSkills, getProjects } from '../services/firebase';

export default function Chatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Chào bạn! Tôi là trợ lý ảo của Lâm. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, skills, projects] = await Promise.all([
          getProfile(),
          getSkills(),
          getProjects()
        ]);
        setContextData({ profile, skills, projects });
      } catch (error) {
        console.error('Error fetching context for AI:', error);
      }
    };
    fetchData();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const aiResponse = await getAIResponse(userMsg, contextData);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Xin lỗi, tôi gặp chút trục trặc. Thử lại sau nhé!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Nút mở Chatbot */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 45 }}
            whileHover={{ scale: 1.1, shadow: "0px 0px 20px rgba(99, 102, 241, 0.6)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle size={28} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full"></div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cửa sổ Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, blur: "10px" }}
            animate={{ opacity: 1, y: 0, scale: 1, blur: "0px" }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`
              fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6
              ${isFull ? 'top-4 md:top-auto md:w-[450px] md:h-[700px]' : 'w-auto md:w-[360px] h-[550px] max-h-[80vh]'}
              bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden
              transition-all duration-300 ease-in-out z-[9999]
            `}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-500/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1">
                    Trợ lý AI <Sparkles size={12} className="text-yellow-400" />
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-medium text-slate-400">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsFull(!isFull)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors hidden md:block"
                >
                  {isFull ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-slate-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10, y: 5 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-2`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 mb-1 border border-white/5 shadow-sm">
                      <Bot size={14} />
                    </div>
                  )}
                  <div 
                    className={`
                      max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.role === 'ai' 
                        ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5' 
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none shadow-indigo-500/20'}
                    `}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 border border-white/5">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-800 text-slate-400 px-4 py-2 rounded-2xl rounded-bl-none border border-white/5 flex items-center gap-2 italic text-xs">
                    <Loader2 size={14} className="animate-spin" />
                    Đang tìm câu trả lời...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/50 border-t border-white/5">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="w-full bg-slate-800/50 border border-white/10 text-slate-200 pl-4 pr-12 py-3 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm placeholder:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`
                    absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all
                    ${input.trim() && !loading 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'text-slate-600 cursor-not-allowed'}
                  `}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-500 mt-2 font-mono uppercase tracking-wider">
                Powered by Gemini AI • 2026 Edition
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
