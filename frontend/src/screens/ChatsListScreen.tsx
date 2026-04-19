import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  ChevronLeft,
  Trash2
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { Conversation } from '../types';

export default function ChatsListScreen() {
  console.log('ChatsListScreen Rendering...');
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      
      if (!error) setConversations(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `منذ ${days} يوم`;
    return new Date(dateStr).toLocaleDateString('ar-MA');
  }

  const filtered = conversations.filter(c => 
    (c.title || 'محادثة بدون عنوان').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const confirmed = window.confirm('هل أنت متأكد من حذف هذه المحادثة؟');
    if (!confirmed) return;

    const { error } = await supabase
      .from('conversations')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      console.error('Error deleting conversation:', error);
      alert('حدث خطأ أثناء الحذف. حاول مرة أخرى.');
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FA] overflow-hidden" dir="rtl">
      
      {/* Header */}
      <div className="mx-8 mt-6 bg-white border border-[#E5E7EB] rounded-2xl px-8 py-6 flex items-center justify-between flex-shrink-0 shadow-sm">
        <h1 className="text-xl font-bold text-[#1F2937]">كل المحادثات</h1>
        <button 
          onClick={() => navigate('/chat')}
          className="bg-[#1B3A6B] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#2D4E87] transition-all flex items-center gap-2 shadow-md shadow-[#1B3A6B]/10 active:scale-95"
        >
          <Plus size={18} strokeWidth={2} />
          <span>محادثة جديدة</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mx-8 mt-6 relative flex-shrink-0">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]" strokeWidth={1.5} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في محادثاتك..."
          className="w-full bg-white border border-[#E5E7EB] focus:border-[#1B3A6B] rounded-xl py-4 pr-12 pl-4 text-right text-sm outline-none transition-all shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <p className="text-xs text-[#6B7280] font-bold mb-4 uppercase tracking-widest">محادثاتك مع حقي</p>
        
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="px-6 py-5 border-b border-[#F3F4F6] last:border-b-0 animate-pulse flex justify-between items-center">
                <div className="h-4 bg-gray-100 rounded-md w-48" />
                <div className="h-3 bg-gray-50 rounded-md w-16" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-[#F7F8FA] rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-[#E5E7EB]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold text-[#1F2937] mb-1">لا توجد محادثات بعد</p>
              <p className="text-xs text-[#9CA3AF]">ابدأ محادثتك الأولى مع حقي</p>
            </div>
          ) : (
            filtered.map((c) => (
              <div 
                key={c.id}
                onClick={() => navigate('/chat', { state: { conversationId: c.id } })}
                className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F7F8FA] cursor-pointer transition-colors group"
              >
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors">
                    {c.title || 'محادثة بدون عنوان'}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] mt-0.5">{c.topic || 'عام'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#6B7280]">{timeAgo(c.created_at)}</span>
                    <ChevronLeft size={16} className="text-[#E5E7EB] group-hover:text-[#1B3A6B] transition-all transform group-hover:-translate-x-1" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="p-2 text-[#E5E7EB] hover:text-red-500 transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
