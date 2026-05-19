import React, { useEffect, useState } from 'react';
import { Bot, Plus, Trash2, Edit2, Check, RefreshCw, Send, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  subscribeAiKb, 
  addAiKb, 
  updateAiKb, 
  deleteAiKb, 
  subscribeAiUnanswered, 
  deleteAiUnanswered 
} from '../../services/firebase';

export default function AiQaManager() {
  const [kb, setKb] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [loadingKb, setLoadingKb] = useState(true);
  const [loadingUnanswered, setLoadingUnanswered] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Unanswered answering helper state
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);

  useEffect(() => {
    const unsubKb = subscribeAiKb(
      (data) => {
        setKb(data);
        setLoadingKb(false);
      },
      (error) => {
        console.error('Error fetching AI KB:', error);
        toast.error('Lỗi tải cơ sở kiến thức AI');
        setLoadingKb(false);
      }
    );

    const unsubUnanswered = subscribeAiUnanswered(
      (data) => {
        setUnanswered(data);
        setLoadingUnanswered(false);
      },
      (error) => {
        console.error('Error fetching unanswered questions:', error);
        toast.error('Lỗi tải câu hỏi chưa trả lời');
        setLoadingUnanswered(false);
      }
    );

    return () => {
      unsubKb();
      unsubUnanswered();
    };
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setAnsweringQuestionId(null);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswer(item.answer);
  };

  const handleAnswerUnanswered = (item) => {
    setIsEditing(true);
    setEditingId(null);
    setAnsweringQuestionId(item.id);
    setQuestion(item.question);
    setAnswer('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error('Vui lòng điền đầy đủ câu hỏi và câu trả lời!');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editingId) {
        // Update existing QA
        await updateAiKb(editingId, {
          question: question.trim(),
          answer: answer.trim()
        });
        toast.success('Cập nhật cặp Q&A thành công!');
      } else {
        // Add new QA
        await addAiKb({
          question: question.trim(),
          answer: answer.trim()
        });
        
        // If this was answering an unanswered question, delete it from unanswered collection
        if (answeringQuestionId) {
          await deleteAiUnanswered(answeringQuestionId);
        }
        
        toast.success('Thêm huấn luyện Q&A mới thành công!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving AI Q&A:', error);
      toast.error('Lưu thông tin thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKb = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học Q&A này?')) return;
    try {
      await deleteAiKb(id);
      toast.success('Đã xóa bài học.');
    } catch (error) {
      console.error('Delete AI KB error:', error);
      toast.error('Xóa thất bại');
    }
  };

  const handleDeleteUnanswered = async (id) => {
    if (!window.confirm('Xóa bỏ câu hỏi chưa trả lời này?')) return;
    try {
      await deleteAiUnanswered(id);
      toast.success('Đã gỡ bỏ câu hỏi khỏi hàng đợi.');
    } catch (error) {
      console.error('Delete unanswered error:', error);
      toast.error('Không thể gỡ bỏ');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Cột 1 & 2: Quản lý bộ kiến thức Q&A */}
      <div className="xl:col-span-2 space-y-6">
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Bot className="text-primary" /> Cơ sở Kiến thức Q&A
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Danh sách các câu hỏi và câu trả lời mẫu đã huấn luyện cho AI.
            </p>
          </div>
          <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-3 py-1.5 rounded-full border border-primary/20">
            {kb.length} Cặp Q&A
          </span>
        </div>

        {/* List Q&As */}
        <div className="space-y-4">
          {loadingKb ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : kb.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Chưa có câu hỏi nào được huấn luyện. Bạn hãy thêm câu hỏi mới ở cột bên phải.
            </div>
          ) : (
            kb.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group">
                <div>
                  <div className="flex items-start gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold font-mono px-2 py-0.5 rounded shrink-0 mt-1">Q</span>
                    <h3 className="font-bold text-slate-200 text-sm leading-relaxed">{item.question}</h3>
                  </div>
                  <div className="flex items-start gap-2 mt-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-extrabold font-mono px-2 py-0.5 rounded shrink-0 mt-1">A</span>
                    <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line">{item.answer}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] text-slate-600 font-mono">
                    Cập nhật: {item.updatedAt ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString('vi-VN') : item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'Mặc định'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteKb(item.id)}
                      className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                      title="Xóa bài học"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cột 3: Form huấn luyện + Hàng đợi unanswered */}
      <div className="space-y-6">
        {/* Form Huấn Luyện */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-slate-200 text-base mb-4 flex items-center gap-2">
            {isEditing ? <Edit2 size={18} className="text-yellow-400" /> : <Plus size={18} className="text-primary" />}
            {isEditing ? 'Sửa bài học Q&A' : answeringQuestionId ? 'Huấn luyện câu hỏi chưa có' : 'Thêm huấn luyện Q&A'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Câu hỏi của người dùng
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ví dụ: Lâm có kinh nghiệm thực tập chưa?"
                rows={2}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Câu trả lời mẫu của AI
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Viết câu trả lời chi tiết và chính xác. Hỗ trợ định dạng Markdown."
                rows={5}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-slate-900 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Lưu Huấn Luyện
              </button>
              {(isEditing || question || answer || answeringQuestionId) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Hàng đợi unanswered */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <HelpCircle size={16} className="text-red-400" />
              Câu hỏi chưa thể trả lời
            </h3>
            <span className="bg-red-500/10 text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-500/20">
              {unanswered.length} câu hỏi
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Đây là những câu hỏi do khách truy cập thực tế đã hỏi nhưng AI chưa có thông tin trả lời. Bạn hãy nhấn "Huấn luyện" để dạy AI đáp án!
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {loadingUnanswered ? (
              <div className="flex justify-center items-center py-6">
                <RefreshCw className="animate-spin text-slate-600 w-5 h-5" />
              </div>
            ) : unanswered.length === 0 ? (
              <div className="text-center text-slate-600 text-xs py-8 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                Không có câu hỏi bị bỏ lỡ nào 🎉
              </div>
            ) : (
              unanswered.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors">
                  <p className="text-slate-300 text-xs font-bold leading-normal italic">
                    "{item.question}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600">
                      {item.askedAt ? new Date(item.askedAt.seconds * 1000).toLocaleDateString('vi-VN') : 'Mới đây'}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleAnswerUnanswered(item)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-md transition-colors"
                      >
                        Huấn luyện
                      </button>
                      <button
                        onClick={() => handleDeleteUnanswered(item.id)}
                        className="p-1 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-md transition-colors"
                        title="Bỏ qua"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
