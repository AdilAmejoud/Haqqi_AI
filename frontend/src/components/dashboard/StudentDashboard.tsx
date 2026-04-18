import React from 'react';
import {
  Search,
  BookOpen,
  FileText,
  Download,
  ChevronLeft,
  Scale,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Profile, Conversation } from '../../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase/client';
import { useState, useEffect } from 'react';

interface StudentDashboardProps {
  greeting: string;
  profile: Profile | null;
}

export default function StudentDashboard({ greeting, profile }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentChats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentChats(data ?? []);
      setChatsLoading(false);
    }
    loadRecentChats();
  }, []);
  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#E8EEF7] rounded-xl flex items-center justify-center">
          <Scale size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">مكتبة القانون المغربي</h1>
          <p className="text-xs text-[#6B7280]">ابحث وتصفح التشريعات والنماذج</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1B3A6B] p-2 rounded-lg hover:bg-[#2D4E87] transition-colors" title="بحث">
          <Search size={14} className="text-white" />
        </button>
        <input
          className="w-full pr-14 pl-4 py-4 bg-white border border-[#E5E7EB] group-focus-within:border-[#1B3A6B] rounded-xl text-right text-sm outline-none transition-all shadow-sm"
          placeholder="ابحث في القوانين المغربية... (مثال: فصل الموظف، عقد الإيجار)"
          dir="rtl"
        />
      </div>

      {/* Document Templates */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <button className="text-xs text-[#1B3A6B] font-bold hover:underline">عرض الكل ›</button>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#6B7280]" />
            <span className="text-sm font-bold text-[#1F2937]">نماذج الوثائق القانونية</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'عقد الكراء السكني',  type: 'PDF',  size: '38 KB', ref: 'القانون رقم 67.12' },
            { name: 'عقد عمل محدد المدة', type: 'PDF',  size: '45 KB', ref: 'المادة 16 من مدونة الشغل' },
            { name: 'عريضة طلب تعويض',   type: 'DOCX', size: '29 KB', ref: 'ق.ل.ع — الفصل 77' },
            { name: 'مذكرة دفاع جنائية',  type: 'DOCX', size: '62 KB', ref: 'ق.م.ج — الفصل 303' },
          ].map(doc => (
            <div key={doc.name} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-2 hover:border-[#1B3A6B]/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start">
                  <button className="w-8 h-8 bg-[#E8EEF7] group-hover:bg-[#1B3A6B] rounded-lg flex items-center justify-center transition-colors" aria-label="تحميل الوثيقة">
                  <Download size={14} className="text-[#1B3A6B] group-hover:text-white" />
                </button>
                <FileText size={16} className="text-[#6B7280]" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors">{doc.name}</p>
                <p className="text-[10px] text-[#6B7280]">{doc.type} · {doc.size} · {doc.ref}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legislative References */}
      <div>
        <div className="flex items-center gap-2 mb-4 justify-end">
          <span className="text-sm font-bold text-[#1F2937]">مراجع التشريعات</span>
          <BookOpen size={16} className="text-[#6B7280]" />
        </div>
        <div className="space-y-2">
          {[
            { name: 'مدونة الشغل المغربية',    meta: '583 مادة · آخر تعديل 2021', color: '#C9A84C' },
            { name: 'قانون الالتزامات والعقود', meta: '1267 فصل · أصل 1913',      color: '#1B3A6B' },
            { name: 'مدونة الأسرة (مضر)',       meta: '400 مادة · تعديل 2004',     color: '#6B7280' },
            { name: 'القانون الجنائي',          meta: '621 فصل · ق.م.ج 2003',     color: '#1B3A6B' },
          ].map(law => (
            <button key={law.name} className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#1B3A6B]/30 text-right group transition-all" aria-label={`عرض تفاصيل ${law.name}`}>
              <ChevronLeft size={14} className="text-[#6B7280] group-hover:text-[#1B3A6B] transition-transform group-hover:-translate-x-1" />
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="text-right">
                  <p className="text-sm font-bold text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors">{law.name}</p>
                  <p className="text-[10px] text-[#6B7280]">{law.meta}</p>
                </div>
                <div className={`w-1 h-10 rounded-full ${law.color === '#1B3A6B' ? 'bg-[#1B3A6B]' : 'bg-[#6B7280]'}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Chats Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1B3A6B]" />
            <span className="text-sm font-bold text-[#1F2937]">نقاشاتك القانونية</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => navigate('/chat')}
              className="text-[10px] font-black text-[#1B3A6B] bg-[#E8EEF7] px-3 py-1.5 rounded-lg hover:bg-[#1B3A6B] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Plus size={12} strokeWidth={3} />
              نقاش جديد
            </button>
            <button 
              onClick={() => navigate('/chats')}
              className="text-xs text-[#6B7280] hover:text-[#1B3A6B] flex items-center gap-1 transition-colors"
            >
              <span>الكل</span>
              <ChevronLeft size={12} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {chatsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="py-3 flex justify-between items-center animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-50 rounded w-12" />
              </div>
            ))
          ) : recentChats.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-4 bg-[#F7F8FA] rounded-xl border border-dashed border-[#E5E7EB]">لا توجد محادثات بعد</p>
          ) : (
            recentChats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => navigate('/chat', { state: { conversationId: chat.id } })}
                className="flex items-center justify-between py-3 border-b border-[#F3F4F6] last:border-b-0 cursor-pointer hover:bg-[#F7F8FA] -mx-5 px-5 transition-colors group"
              >
                <div className="flex items-center gap-2 text-right">
                  <MessageSquare size={14} className="text-[#9CA3AF] group-hover:text-[#1B3A6B] transition-colors" />
                  <span className="text-sm text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors truncate max-w-[200px]">
                    {chat.title || 'محادثة بدون عنوان'}
                  </span>
                </div>
                <span className="text-[10px] text-[#6B7280]">
                  {new Date(chat.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Research Banner */}
      <div className="bg-[#1B3A6B] rounded-xl p-6 flex items-center gap-4 relative overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-12 h-12 bg-[#C9A84C] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Scale size={24} className="text-[#1B3A6B]" />
        </div>
        <div className="text-right flex-1">
          <p className="text-white font-bold text-base">مساعد البحث القانوني</p>
          <p className="text-white/60 text-xs">ابحث بالفرضيات، قارن التشريعات، واحصل على تحليل فقهي</p>
        </div>
        <ChevronLeft size={20} className="text-white/40 group-hover:text-white transition-all group-hover:-translate-x-1" />
      </div>

    </div>
  );
}
