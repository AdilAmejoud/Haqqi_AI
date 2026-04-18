import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Scale, 
  Paperclip, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  FileText, 
  X, 
  CheckCircle, 
  Loader, 
  Circle,
  Gavel,
  Briefcase,
  ScrollText,
  KeyRound,
  UsersRound,
  MessageSquareText,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Profile, Conversation, Message as DBMessage } from '../types';
import { supabase } from '../utils/supabase/client';
import { getSystemPrompt } from '../utils/supabase/getSystemPrompt';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  attachment?: { name: string; type: string };
}

interface ChatScreenProps {
  profile: Profile | null;
}

const QUICK_CHIPS = [
  { text: 'حقوق الشغل', icon: Briefcase, color: '#1B3A6B', prompt: 'شرح ليا حقوقي في الشغل' },
  { text: 'مسطرة إدارية', icon: ScrollText, color: '#C9A84C', prompt: 'كيفاش نجدد البطاقة الوطنية؟' },
  { text: 'قانون الكراء', icon: KeyRound, color: '#1B3A6B', prompt: 'ما هي حقوقي كمكتري؟' },
  { text: 'قانون الأسرة', icon: UsersRound, color: '#C9A84C', prompt: 'شرح ليا مسطرة الطلاق' },
];

const REASONING_STEPS = [
  'جارٍ البحث في المصادر القانونية',
  'تحليل القانون المغربي المعمول به',
  'صياغة الإجابة القانونية',
];

export default function ChatScreen({ profile }: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reasoningStep, setReasoningStep] = useState(0);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showUploadMenu, setShowUploadMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.conversationId) {
      setSelectedConvId(location.state.conversationId);
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      
      setConversations(data ?? []);
      setLoading(false);
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    } else {
      setMessages([]);
    }
  }, [selectedConvId]);

  async function loadMessages(convId: string) {
    setLoadingMessages(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
    setLoadingMessages(false);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let convId = selectedConvId;

    // Create conversation on first message
    if (!convId) {
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: text.slice(0, 60),
          topic: 'general'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }
      convId = conv.id;
      setSelectedConvId(convId);
      setConversations(prev => [conv, ...prev]);
    }

    // Save user message
    const userMsg = {
      conversation_id: convId,
      role: 'user' as const,
      content: text,
    };

    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert(userMsg)
      .select()
      .single();

    if (savedUserMsg) {
      setMessages(prev => [...prev, savedUserMsg]);
    }

    setInputText('');
    setIsTyping(true);
    setReasoningStep(0);

    // Simulate AI response
    setTimeout(() => {
      setReasoningStep(1);
      setTimeout(() => {
        setReasoningStep(2);
        setTimeout(async () => {
          const aiResponseText = 'أهلاً بك. أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك في استشارتك اليوم؟';
          const aiMsg = {
            conversation_id: convId as string,
            role: 'assistant' as const,
            content: aiResponseText,
          };

          const { data: savedAiMsg } = await supabase
            .from('messages')
            .insert(aiMsg)
            .select()
            .single();

          if (savedAiMsg) {
            setMessages(prev => [...prev, savedAiMsg]);
          }
          setIsTyping(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden" dir="rtl">
      
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E8EEF7] rounded-lg flex items-center justify-center">
            <Gavel size={16} className="text-[#1B3A6B]" strokeWidth={2} />
          </div>
          <span className="text-sm font-black text-[#1F2937]">دردشة حقي AI</span>
        </div>
        
        <button
          onClick={() => navigate('/chats')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#1B3A6B] transition-colors"
        >
          <span>كل المحادثات</span>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loadingMessages ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader size={24} className="animate-spin text-[#1B3A6B]" />
            <p className="mt-2 text-xs text-[#6B7280]">جاري تحميل المحادثة...</p>
          </div>
        ) : isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1B3A6B] to-[#2D4E87] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-[#1B3A6B]/20 rotate-3">
              <Gavel size={36} className="text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">مرحباً {profile?.full_name}</h2>
            
            {/* Recent Conversations Selection if empty */}
            {conversations.length > 0 && (
              <div className="mb-8 w-full max-w-md">
                <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mb-4">محادثاتك الأخيرة</p>
                <div className="flex flex-col gap-2">
                  {conversations.slice(0, 3).map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className="w-full p-3 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#1B3A6B] text-right flex items-center justify-between group"
                    >
                      <ChevronLeft size={14} className="text-[#E5E7EB] group-hover:text-[#1B3A6B]" />
                      <span className="text-sm text-[#1F2937] truncate">{conv.title || 'محادثة بدون عنوان'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[#6B7280] text-sm mb-10 max-w-xs mx-auto">أنا هنا لمساعدتك في أي تساؤل قانوني مغربي. كيف أبدأ معك اليوم؟</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {QUICK_CHIPS.map((chip, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(chip.prompt)}
                  className="p-5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#1B3A6B] hover:shadow-lg hover:shadow-[#1B3A6B]/5 transition-all text-center group flex flex-col items-center justify-center min-h-[110px]"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors bg-[#F7F8FA] group-hover:bg-[#E8EEF7]`}>
                    <chip.icon size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-bold text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors">{chip.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1B3A6B] text-white rounded-tr-none' 
                      : 'bg-[#F7F8FA] text-[#1F2937] border border-[#E5E7EB] rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] mt-1 px-1">{new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-end w-full">
                <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl rounded-tl-none p-4 min-w-[240px] shadow-sm">
                  <div className="space-y-3">
                    {REASONING_STEPS.map((step, idx) => (
                      <div key={idx} className={`flex items-center gap-2 text-xs ${idx <= reasoningStep ? 'text-[#1B3A6B]' : 'text-[#9CA3AF]'}`}>
                        {idx < reasoningStep ? <CheckCircle size={14} className="text-green-500" /> : idx === reasoningStep ? <Loader size={14} className="animate-spin" /> : <Circle size={14} />}
                        <span className={idx === reasoningStep ? 'font-bold' : ''}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-[#F3F4F6] bg-[#F7F8FA]/50">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              ref={inputRef}
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب سؤالك بالدارجة..." 
              className="w-full bg-white border border-[#E5E7EB] focus:border-[#1B3A6B] rounded-2xl py-4 pr-4 pl-14 text-sm transition-all outline-none shadow-sm"
              dir="rtl"
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {selectedConvId && (
                <button 
                  onClick={() => setSelectedConvId(null)}
                  className="p-2 text-[#6B7280] hover:text-[#1B3A6B] transition-colors" 
                  title="محادثة جديدة"
                >
                  <Plus size={20} strokeWidth={1.5} />
                </button>
              )}
              <button className="p-2 text-[#6B7280] hover:text-[#1B3A6B] transition-colors" title="تسجيل صوتي"><Mic size={20} strokeWidth={1.5} /></button>
              <button className="p-2 text-[#6B7280] hover:text-[#1B3A6B] transition-colors" title="إرفاق ملف"><Paperclip size={20} strokeWidth={1.5} /></button>
            </div>
          </div>
          <button 
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="w-12 h-12 bg-[#1B3A6B] hover:bg-[#2D4E87] disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95"
            title="إرسال"
          >
            <Send size={20} className="rotate-180" strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-[10px] text-[#9CA3AF] text-center mt-3 font-medium">مساعد حقي هو ذكاء اصطناعي، يقدم معلومات قانونية عامة ولا يعوض استشارة المحامي.</p>
      </div>
    </div>
  );
}
