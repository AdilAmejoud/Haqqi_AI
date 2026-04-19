import React, { useState, useEffect } from 'react';
import {
  Scale,
  Briefcase,
  Home,
  Users,
  Car,
  Heart,
  ChevronLeft,
  Phone,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Profile, Conversation } from '../../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase/client';
import { SUGGESTED_QUESTIONS } from '../../utils/constants';

interface CitizenDashboardProps {
  greeting: string;
  profile: Profile | null;
}

const TopicCard = ({ icon: Icon, title, sub }: { icon: any, title: string, sub: string }) => (
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:border-[#1B3A6B]/30 transition-all cursor-pointer group">
    <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] flex items-center justify-center mb-3 group-hover:bg-[#E8EEF7] transition-colors">
      <Icon size={18} className="text-[#6B7280] group-hover:text-[#1B3A6B]" strokeWidth={1.5} />
    </div>
    <p className="font-bold text-[#1F2937] text-sm mb-1">{title}</p>
    <p className="text-xs text-[#6B7280]">{sub}</p>
  </div>
);

export default function CitizenDashboard({ greeting, profile }: CitizenDashboardProps) {
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  const startConversationWithQuestion = async (questionText: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create conversation
    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: questionText.slice(0, 60),
        topic: null,
      })
      .select()
      .single();

    if (error) return;

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conv.id,
      role: 'user',
      content: questionText,
    });

    // Navigate to chat with this conversation loaded
    navigate('/chat', { state: { conversationId: conv.id, initialMessage: questionText } });
  };

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

      {/* Hero Banner */}
      <div className="bg-[#1B3A6B] rounded-2xl p-8 text-right relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/20 text-[#C9A84C] text-xs px-3 py-1 rounded-full border border-[#C9A84C]/30 mb-3">
            <Scale size={12} /> {greeting}، {profile?.full_name}
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">واش عندك سؤال قانوني؟</h1>
          <p className="text-white/60 text-sm mb-5">سولنا بالدارجة، حنا هنا نعاونك 🤝</p>
          <button 
            onClick={() => navigate('/chat')}
            className="bg-[#C9A84C] text-[#1B3A6B] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#E8C96D] transition-colors flex items-center gap-2 w-fit"
          >
            ابدأ المحادثة
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Common Questions */}
      <div>
        <p className="text-xs font-bold text-[#6B7280] text-right mb-3 uppercase tracking-wider">أسئلة شائعة — اضغط مباشرة</p>
        <div className="space-y-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button 
              key={q.id}
              onClick={() => startConversationWithQuestion(q.question)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#1B3A6B] hover:shadow-lg hover:shadow-[#1B3A6B]/5 text-right group transition-all"
            >
              <div className="flex items-center gap-3">
                <q.icon size={16} className="text-[#6B7280] group-hover:text-[#1B3A6B]" strokeWidth={1.5} />
                <span className="text-sm font-bold text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors">{q.question}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F7F8FA] group-hover:bg-[#E8EEF7] flex items-center justify-center transition-colors">
                <ChevronLeft size={16} className="text-[#6B7280] group-hover:text-[#1B3A6B] group-hover:-translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Chats Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
            <span className="text-sm font-bold text-[#1F2937]">محادثاتك مع حقي</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => navigate('/chat')}
              className="text-[10px] font-black text-[#1B3A6B] bg-[#E8EEF7] px-3 py-1.5 rounded-lg hover:bg-[#1B3A6B] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Plus size={12} strokeWidth={3} />
              جديدة
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
                <div className="flex items-center gap-2">
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

      {/* Topic Cards */}
      <div>
        <p className="text-xs font-bold text-[#6B7280] text-right mb-3 uppercase tracking-wider">مواضيع رئيسية</p>
        <div className="grid grid-cols-2 gap-3">
          <TopicCard icon={Heart}     title="الأسرة والإرث"  sub="طلاق، نفقة، حضانة، ميراث" />
          <TopicCard icon={Briefcase} title="حقوق الشغل"     sub="فصل تعسفي، تعويضات، عقود" />
        </div>
      </div>

      {/* Community Banner */}
      <button 
        onClick={() => navigate('/community')}
        className="w-full bg-[#F5EDCC] rounded-xl p-4 flex items-center justify-between border border-[#C9A84C]/20 hover:border-[#C9A84C]/40 hover:bg-[#EBE3C1] transition-all group"
      >
        <div className="text-right">
          <p className="font-bold text-[#1B3A6B] text-sm group-hover:text-[#142A51] transition-colors">منتدى المجتمع</p>
          <p className="text-xs text-[#6B7280]">شارك تجربتك وساعد مواطنين آخرين</p>
        </div>
        <div className="text-[#1B3A6B] text-sm font-bold flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
          ادخل
          <ChevronLeft size={16} />
        </div>
      </button>

      {/* Footer line */}
      <div className="flex justify-between items-center text-xs text-[#6B7280] pt-2 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-1 font-bold text-[#1B3A6B]">
          <Phone size={14} />
          <span dir="ltr">0613-880-860</span>
        </div>
        <span className="font-medium">خط المساعدة المجانية →</span>
      </div>

    </div>
  );
}
