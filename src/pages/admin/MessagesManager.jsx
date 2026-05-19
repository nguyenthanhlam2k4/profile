import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Search, 
  Mail, 
  Calendar, 
  MessageSquare, 
  User, 
  Loader2, 
  Inbox, 
  AlertCircle,
  Send,
  CheckCircle
} from 'lucide-react';
import { subscribeMessages, deleteMessage, replyMessage } from '../../services/firebase';
import toast from 'react-hot-toast';

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingIds, setReplyingIds] = useState({});

  const handleSendReply = async (msg) => {
    const text = replyTexts[msg.id]?.trim();
    if (!text) {
      toast.error('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setReplyingIds(prev => ({ ...prev, [msg.id]: true }));
    try {
      await replyMessage(msg.id, text);
      
      const subject = `Re: ${msg.subject || 'Liên hệ từ Website'}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      
      window.open(gmailUrl, '_blank');
      
      setReplyTexts(prev => ({ ...prev, [msg.id]: '' }));
      toast.success('Đã lưu phản hồi và chuyển hướng tới Gmail!');
    } catch (error) {
      console.error('Error replying to message on web:', error);
      toast.error('Gặp lỗi khi gửi phản hồi.');
    } finally {
      setReplyingIds(prev => ({ ...prev, [msg.id]: false }));
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeMessages(
      (data) => {
        setMessages(data || []);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to messages:', error);
        toast.error('Không thể tải danh sách tin nhắn thời gian thực.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này không? Hành động này không thể hoàn tác.')) {
      setDeletingId(id);
      try {
        await deleteMessage(id);
        toast.success('Đã xóa tin nhắn thành công!');
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Xóa thất bại. Vui lòng thử lại.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '---';
    try {
      let dateObj;
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        dateObj = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        dateObj = dateValue;
      } else if (dateValue.seconds) {
        dateObj = new Date(dateValue.seconds * 1000);
      } else {
        dateObj = new Date(dateValue);
      }
      
      return dateObj.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Không rõ thời gian';
    }
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter(msg => {
    const term = searchTerm.toLowerCase();
    return (
      (msg.name && msg.name.toLowerCase().includes(term)) ||
      (msg.email && msg.email.toLowerCase().includes(term)) ||
      (msg.subject && msg.subject.toLowerCase().includes(term)) ||
      (msg.message && msg.message.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <Inbox className="text-primary" /> Hộp thư liên hệ ({messages.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">Đọc và quản lý các tin nhắn từ khách truy cập website của bạn.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm tin nhắn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Messages List Area */}
      <div className="space-y-4">
        {filteredMessages.map((msg) => (
          <div 
            key={msg.id} 
            className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden"
          >
            {/* Top row: Sender Meta and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800/60">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {/* Sender Name */}
                <div className="flex items-center gap-2 text-slate-200 font-bold">
                  <User size={16} className="text-slate-500" />
                  <span>{msg.name}</span>
                  {msg.replied && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                      <CheckCircle size={10} /> Đã phản hồi
                    </span>
                  )}
                </div>

                {/* Sender Email */}
                <a 
                  href={`mailto:${msg.email}`}
                  className="flex items-center gap-2 text-sky-400 hover:text-primary transition-colors font-medium font-mono"
                >
                  <Mail size={16} className="text-slate-500" />
                  <span>{msg.email}</span>
                </a>

                {/* Received Time */}
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={16} className="text-slate-500" />
                  <span>{formatDate(msg.date)}</span>
                </div>
              </div>

              {/* Action: Delete */}
              <button
                onClick={() => handleDelete(msg.id)}
                disabled={deletingId === msg.id}
                className="text-slate-500 hover:text-red-400 p-2 rounded-xl bg-slate-950/40 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all self-end md:self-auto"
                title="Xóa tin nhắn"
              >
                {deletingId === msg.id ? (
                  <Loader2 size={18} className="animate-spin text-red-400" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>

            {/* Message Details */}
            <div className="pt-4 space-y-3">
              {/* Subject */}
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono bg-slate-950 text-primary px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shrink-0 mt-0.5">
                  Tiêu đề
                </span>
                <h4 className="text-slate-200 font-semibold text-base leading-snug">
                  {msg.subject || 'Không có tiêu đề'}
                </h4>
              </div>
              {/* Body */}
              <div className="mt-2 bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-medium">
                  {msg.message}
                </p>
              </div>

              {/* Reply History */}
              {msg.replied && (
                <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle size={14} /> BẠN ĐÃ PHẢN HỒI:
                  </div>
                  <p className="text-slate-300 text-sm italic">"{msg.replyText}"</p>
                  {msg.repliedAt && (
                    <div className="text-[10px] text-slate-500">
                      Thời gian: {formatDate(msg.repliedAt)}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Reply Form */}
              <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-3">
                <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider">
                  {msg.replied ? 'Gửi phản hồi khác qua Gmail' : 'Phản hồi nhanh qua Gmail'}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <textarea
                    placeholder="Nhập nội dung phản hồi khách hàng..."
                    value={replyTexts[msg.id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                    rows={2}
                    className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                  />
                  <button
                    onClick={() => handleSendReply(msg)}
                    disabled={replyingIds[msg.id]}
                    className="sm:w-44 h-11 shrink-0 bg-sky-500/10 hover:bg-sky-500 border border-sky-500/20 hover:border-transparent text-sky-400 hover:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {replyingIds[msg.id] ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Phản hồi qua Gmail</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty States */}
        {filteredMessages.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-slate-950 text-slate-600">
              <Inbox size={48} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-300">
                {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Hộp thư trống'}
              </h4>
              <p className="text-sm text-slate-500">
                {searchTerm 
                  ? 'Hãy thử thay đổi từ khóa tìm kiếm của bạn.' 
                  : 'Tất cả các tin nhắn từ khách truy cập sẽ hiển thị ở đây.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
