import React from 'react';
import {
  Users,
  AlertCircle,
  Briefcase,
  Sparkles,
  Lightbulb,
  Scale,
  FileEdit,
  FileText,
  Plus,
  ChevronLeft,
  FolderOpen,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Profile, Case, Conversation } from '../../types';
import { supabase } from '../../utils/supabase/client';
import { useState, useEffect } from 'react';

interface ExpertDashboardProps {
  greeting: string;
  profile: Profile | null;
}

export default function ExpertDashboard({ greeting, profile }: ExpertDashboardProps) {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCases(data);
      }
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  const totalCases = cases.length;
  const activeCount = cases.filter(c => c.status === 'active' || c.status === 'new').length;
  const uniqueClients = new Set(cases.map(c => c.client_name).filter(Boolean)).size;

  const activeCasesForList = cases
    .filter(c => c.status === 'active' || c.status === 'new')
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-right">
          <h1 className="text-xl font-bold text-[#1F2937]">لوحة المحامي</h1>
          <p className="text-xs text-[#6B7280]">إدارة القضايا · صياغة العقود · تحليل المستندات</p>
        </div>
        <div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,       value: loading ? '...' : uniqueClients, label: 'موكلون',        color: '#1B3A6B' },
          { icon: AlertCircle, value: loading ? '...' : activeCount,   label: 'قضايا جارية',  color: '#C9A84C' },
          { icon: Briefcase,   value: loading ? '...' : totalCases,    label: 'إجمالي القضايا', color: '#1B3A6B' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center shadow-sm">
            <stat.icon size={20} strokeWidth={1.5} className={`mx-auto mb-2 ${stat.color === '#1B3A6B' ? 'text-[#1B3A6B]' : 'text-[#C9A84C]'}`} />
            <p className="text-2xl font-black text-[#1F2937]">{stat.value}</p>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Tools */}
      <div>
        <div className="flex items-center gap-2 mb-4 justify-end">
          <span className="text-sm font-bold text-[#1F2937]">أدوات الذكاء الاصطناعي</span>
          <Sparkles size={16} className="text-[#C9A84C]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Lightbulb, label: 'اقتراح استراتيجية' },
            { icon: Scale,     label: 'تحليل قانوني' },
            { icon: FileEdit,  label: 'مذكرة دفاع' },
            { icon: FileText,  label: 'صياغة عقد' },
          ].map(tool => (
            <button key={tool.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center hover:border-[#1B3A6B]/40 hover:bg-[#E8EEF7] transition-all group">
              <tool.icon size={24} className="text-[#1B3A6B] mx-auto mb-2 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <p className="text-[11px] text-[#1F2937] font-bold">{tool.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Chats Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
            <span className="text-sm font-bold text-[#1F2937]">المحادثات الأخيرة</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/chat')}
              className="text-[10px] font-black text-[#1B3A6B] bg-[#E8EEF7] px-3 py-1.5 rounded-lg hover:bg-[#1B3A6B] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Plus size={12} strokeWidth={3} />
              محادثة جديدة
            </button>
            <button 
              onClick={() => navigate('/chats')}
              className="text-xs text-[#6B7280] hover:text-[#1B3A6B] flex items-center gap-1 transition-colors"
            >
              <span>عرض الكل</span>
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
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#9CA3AF] group-hover:text-[#1B3A6B] transition-colors" />
                  <span className="text-sm text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors truncate max-w-[200px]">
                    {chat.title || 'محادثة بدون عنوان'}
                  </span>
                </div>
                <span className="text-[10px] text-[#9CA3AF]">
                  {new Date(chat.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#C9A84C] rounded-full" />
            <span className="text-sm font-bold text-[#1F2937]">القضايا الجارية</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/cases')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E8EEF7] text-[#1B3A6B] rounded-lg text-xs font-bold hover:bg-[#1B3A6B] hover:text-white transition-all"
            >
              <span>عرض الكل</span>
              <ChevronLeft size={14} strokeWidth={2} className="rotate-180" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-[#6B7280]">جاري تحميل البيانات...</p>
            </div>
          ) : activeCasesForList.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
              <p className="text-sm text-[#6B7280]">لا توجد قضايا جارية حالياً.</p>
            </div>
          ) : (
            activeCasesForList.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="group bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:border-[#1B3A6B]/30 hover:shadow-sm cursor-pointer transition-all gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#E8EEF7] rounded-xl flex items-center justify-center group-hover:bg-[#1B3A6B] transition-colors">
                    <FolderOpen size={18} className="text-[#1B3A6B] group-hover:text-white transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-[#1F2937] mb-0.5 group-hover:text-[#1B3A6B] transition-colors">{c.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <User size={12} strokeWidth={1.5} />
                        {c.client_name || 'بدون اسم'}
                      </span>
                      {c.reference_number && (
                        <span className="flex items-center gap-1">
                          <Scale size={12} strokeWidth={1.5} />
                          {c.reference_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#6B7280] mb-0.5">الجلسة القادمة</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B3A6B]">
                      <Calendar size={14} strokeWidth={1.5} />
                      <span>{c.next_hearing ? new Date(c.next_hearing).toLocaleDateString('ar-MA') : 'غير محدد'}</span>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    c.status === 'active' ? 'bg-[#F5EDCC] text-[#8B6914]' : 'bg-[#E8EEF7] text-[#1B3A6B]'
                  }`}>
                    {c.status === 'active' ? 'جارية' : 'جديدة'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button onClick={() => navigate('/cases/new')} className="w-full mt-4 py-4 border-2 border-dashed border-[#E5E7EB] rounded-xl text-sm font-bold text-[#6B7280] hover:border-[#1B3A6B]/40 hover:text-[#1B3A6B] hover:bg-[#F7F8FA] transition-all flex items-center justify-center gap-2">
          <Plus size={18} strokeWidth={2.5} /> إضافة قضية جديدة
        </button>
      </div>

    </div>
  );
}
