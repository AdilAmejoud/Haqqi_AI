import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Scale,
  FolderOpen,
  ChevronLeft,
  Paperclip,
  FileText,
  Plus,
  X,
  Lock,
  Calendar,
  Send,
  MoreVertical,
  Circle,
  CheckCircle,
  Loader,
  Pencil,
  Trash2,
  Clock,
  Star,
  Archive
} from 'lucide-react';
import { Profile, Case, Message, Conversation } from '../types';
import { supabase } from '../utils/supabase/client';

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:8000';

interface CaseWorkspaceScreenProps {
  profile: Profile | null;
}

export default function CaseWorkspaceScreen({ profile }: CaseWorkspaceScreenProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [instructions, setInstructions] = useState('');
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [pdfTexts, setPdfTexts] = useState<Record<string, string>>({});
  const [isTypingSteps, setIsTypingSteps] = useState(0);

  const REASONING_STEPS = [
    'جارٍ تحليل ملف القضية',
    'مراجعة القانون المغربي المعمول به',
    'صياغة الرأي القانوني',
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!id) return;
    async function loadCase() {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setCaseData(data);
        if (data.notes) setInstructions(data.notes);
        
        // Load or create conversation for this case
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', data.lawyer_id)
          .eq('title', data.title) 
          .limit(1)
          .maybeSingle();
        
        if (conv) {
          setConversationId(conv.id);
          loadMessages(conv.id);
        }
      }
      setLoading(false);
    }
    loadCase();
  }, [id]);

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setChatMessages(data ?? []);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const extractPdfText = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let text = '';
          for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it: any) => it.str).join(' ') + '\n';
          }
          resolve(text.slice(0, 10000));
        } catch { resolve(''); }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  async function handleSend() {
    if (!message.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let convId = conversationId;

    if (!convId) {
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: caseData?.title || 'محادثة قضية',
          topic: caseData?.category || 'legal',
        })
        .select()
        .single();
      if (error) return;
      convId = conv.id;
      setConversationId(convId);
    }

    const { data: savedMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, role: 'user', content: message })
      .select()
      .single();

    if (savedMsg) setChatMessages(prev => [...prev, savedMsg]);
    setMessage('');
    setIsTyping(true);
    setIsTypingSteps(0);

    const stepInterval = setInterval(() => {
      setIsTypingSteps(prev => {
        if (prev < REASONING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1200);

    const pdfContext = Object.entries(pdfTexts)
      .map(([name, text]) => `--- ${name} ---\n${text}`)
      .join('\n\n')
      .slice(0, 10000);

    const history = chatMessages.slice(-8).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(`${BRIDGE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history,
          legal_level: 'expert',
          domain: null,
          conversation_id: convId,
          pdf_context: pdfContext || null,
          pdf_filename: files.length > 0
            ? files.map(f => f.name).join(', ')
            : null,
          case_context: {
            title: caseData?.title,
            client_name: caseData?.client_name,
            category: caseData?.category,
            instructions: instructions,
          },
        }),
      });

      clearInterval(stepInterval);

      const data = await response.json();
      const { data: aiMsg } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId as string,
          role: 'assistant',
          content: data.reply,
          sources: data.sources ?? null,
        })
        .select()
        .single();

      if (aiMsg) setChatMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      clearInterval(stepInterval);
      const { data: errMsg } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId as string,
          role: 'assistant',
          content: 'خطأ في الاتصال بالخادم. تأكد أن bridge.py شغال على المنفذ 8000.',
          sources: null,
        })
        .select()
        .single();
      if (errMsg) setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F7F8FA]" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#1B3A6B] text-xs font-black">جاري تحميل ملف القضية...</p>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="h-full flex flex-col bg-[#F7F8FA] p-6 gap-6 overflow-hidden" dir="rtl">

      {/* Header — ULTRA ROUNDED */}
      <div className="bg-white border border-[#E5E7EB] rounded-[2.5rem] px-8 py-5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/cases')} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1B3A6B] font-bold transition-all" title="العودة للقائمة">
            كل القضايا
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="text-[#E5E7EB] text-2xl font-light">/</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8EEF7] rounded-2xl flex items-center justify-center shadow-inner">
              <FolderOpen size={18} className="text-[#1B3A6B]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-[#1F2937] leading-tight">{caseData.title}</span>
              <span className="text-[10px] text-[#9CA3AF] font-bold uppercase">{caseData.category || 'عام'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10 relative">
          <div className="flex items-center gap-3 bg-[#F7F8FA] px-4 py-2 rounded-2xl border border-[#E5E7EB]">
            <div className={`w-2 h-2 rounded-full animate-pulse ${caseData.status === 'active' ? 'bg-[#C9A84C]' : 'bg-[#1B3A6B]'}`} />
            <span className="text-xs font-black text-[#1B3A6B]">
              {caseData.status === 'active' ? 'قضية جارية' : 
               caseData.status === 'new' ? 'قضية جديدة' : 
               caseData.status === 'completed' ? 'قضية مكتملة' : 'قضية مؤرشفة'}
            </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-[#9CA3AF] hover:text-[#1F2937] transition-colors p-2 rounded-xl hover:bg-[#F7F8FA]"
            title="خيارات"
            aria-label="خيارات"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute left-0 top-16 z-50 bg-white border border-[#E5E7EB] rounded-[1.5rem] shadow-2xl py-3 min-w-[200px] overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
              
              {/* Star */}
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#1F2937] hover:bg-[#F7F8FA] transition-colors text-right"
              >
                <Star size={16} className={isStarred ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-[#6B7280]'} />
                <span>{isStarred ? 'إلغاء التمييز' : 'تمييز القضية'}</span>
              </button>

              {/* Edit */}
              <button
                onClick={() => navigate(`/cases/${id}/edit`)}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#1F2937] hover:bg-[#F7F8FA] transition-colors text-right"
              >
                <Pencil size={16} className="text-[#6B7280]" />
                <span>تعديل التفاصيل</span>
              </button>

              <div className="border-t border-[#F3F4F6] my-2" />
              <div className="px-5 py-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">تغيير الحالة</div>
              
              {[
                { key: 'new', label: 'قضية جديدة', icon: Circle, color: 'text-[#1B3A6B]' },
                { key: 'active', label: 'قضية جارية', icon: Clock, color: 'text-[#8B6914]' },
                { key: 'completed', label: 'قضية مكتملة', icon: CheckCircle, color: 'text-[#3B6D11]' },
              ].map(status => (
                <button
                  key={status.key}
                  onClick={async () => {
                    const { error } = await supabase.from('cases').update({ status: status.key }).eq('id', id);
                    if (!error) setCaseData(prev => prev ? { ...prev, status: status.key as any } : null);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-right hover:bg-[#F7F8FA] transition-colors ${caseData.status === status.key ? 'bg-[#E8EEF7] font-extrabold text-[#1B3A6B]' : 'text-[#6B7280]'}`}
                >
                  <status.icon size={15} />
                  <span>{status.label}</span>
                </button>
              ))}

              <button
                onClick={async () => {
                  const { error } = await supabase.from('cases').update({ status: 'archived' }).eq('id', id);
                  if (!error) setCaseData(prev => prev ? { ...prev, status: 'archived' as any } : null);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-right hover:bg-[#F7F8FA] transition-colors border-t border-[#F3F4F6]"
              >
                <Archive size={16} className="text-[#6B7280]" />
                <span>أرشفة القضية</span>
              </button>

              <button
                onClick={async () => {
                  if (confirm('هل أنت متأكد من حذف هذه القضية نهائياً؟')) {
                    const { error } = await supabase.from('cases').delete().eq('id', id);
                    if (!error) navigate('/cases');
                  }
                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-right text-red-500 hover:bg-red-50 transition-colors border-t border-[#F3F4F6]"
              >
                <Trash2 size={16} />
                <span>حذف نهائي</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid — Layout Swap: Chat Area on right, Sidebar on left */}
      <div className="flex-1 flex gap-6 overflow-hidden relative">
        
        {/* Chat Area — Now on the RIGHT (first child in RTL) */}
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[3rem] shadow-sm flex flex-col overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#1B3A6B] to-[#2D4E87] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-[#1B3A6B]/20 rotate-3">
                   <Scale size={42} className="text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-[#1F2937] mb-3">{caseData.title}</h2>
                <div className="flex items-center gap-2 mb-8 justify-center">
                  <span className="px-5 py-1.5 bg-[#E8EEF7] text-[#1B3A6B] text-[11px] font-black rounded-xl border border-[#1B3A6B]/10">{caseData.category || 'عام'}</span>
                  <span className="px-5 py-1.5 bg-white text-[#6B7280] text-[11px] font-black rounded-xl border border-[#E5E7EB]">الموكل: {caseData.client_name}</span>
                </div>
                <p className="text-base text-[#6B7280] max-w-sm font-bold leading-relaxed opacity-60">أنا هنا لمساعدتك في تحليل الملف، تلخيص المذكرات، أو تقديم استشارات قانونية دقيقة.</p>
                {files.length > 0 && (
                  <button
                    onClick={() => {
                      setMessage(`حلل لي وثائق القضية: ${files.map(f => f.name).join('، ')}`);
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#E8EEF7] text-[#1B3A6B] text-xs font-bold rounded-2xl hover:bg-[#1B3A6B] hover:text-white transition-all"
                  >
                    تحليل الملفات المرفقة ←
                  </button>
                )}
              </div>
            ) : (
              <>
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${msg.role === 'user' ? 'bg-[#1B3A6B] text-white rounded-tr-none' : 'bg-[#F7F8FA] text-[#1F2937] border border-[#E5E7EB] rounded-tl-none font-bold'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-end w-full">
                    <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-[2rem] rounded-tl-none p-5 shadow-sm min-w-[220px]">
                      <div className="space-y-2.5">
                        {REASONING_STEPS.map((step, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 text-xs transition-all ${
                              idx <= isTypingSteps ? 'text-[#1B3A6B]' : 'text-[#9CA3AF]'
                            }`}
                          >
                            {idx < isTypingSteps
                              ? <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                              : idx === isTypingSteps
                              ? <Loader size={13} className="animate-spin flex-shrink-0" />
                              : <Circle size={13} className="flex-shrink-0" />}
                            <span className={idx === isTypingSteps ? 'font-bold' : ''}>
                              {step}
                            </span>
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
          <div className="p-8 border-t border-[#F3F4F6] bg-white">
            <div className="max-w-4xl mx-auto flex items-center gap-5 bg-[#F7F8FA] border-2 border-[#E5E7EB] rounded-[2rem] px-6 py-4 focus-within:border-[#1B3A6B] focus-within:bg-white transition-all shadow-sm">
              <button onClick={() => fileInputRef.current?.click()} className="text-[#9CA3AF] hover:text-[#1B3A6B] transition-colors p-1" title="إرفاق ملف"><Paperclip size={22} strokeWidth={1.5} /></button>
              <input 
                type="text" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="اكتب رسالتك للمساعد القانوني..." 
                className="flex-1 bg-transparent text-right text-base text-[#1F2937] outline-none font-bold placeholder-[#9CA3AF]"
                title="رسالة الشات"
              />
              <button 
                onClick={handleSend}
                disabled={!message.trim() || isTyping}
                className="w-12 h-12 bg-[#1B3A6B] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-[#1B3A6B]/30 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                title="إرسال"
              >
                <Send size={20} className="rotate-180" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Toggle — Positioned for the new layout (left side/end) */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute z-30 w-7 h-10 bg-white border border-[#E5E7EB] rounded-xl shadow-md flex items-center justify-center text-[#1B3A6B] hover:bg-[#E8EEF7] transition-all top-1/2 -translate-y-1/2 ${sidebarOpen ? 'left-[305px]' : '-left-2.5'}`}
          title={sidebarOpen ? "إغلاق" : "فتح"}
        >
          <ChevronLeft 
            size={14} 
            strokeWidth={2} 
            className={sidebarOpen ? '' : 'rotate-180'} 
          />
        </button>

        {/* Sidebar — Now on the LEFT (second child in RTL) */}
        {sidebarOpen && (
          <div className="w-[320px] bg-white border border-[#E5E7EB] rounded-[3rem] shadow-sm flex flex-col overflow-y-auto flex-shrink-0 h-full p-8 space-y-10">
            
            {/* Memory */}
            <div className="bg-[#1B3A6B]/[0.02] p-6 rounded-[2rem] border border-[#1B3A6B]/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black text-[#1F2937]">الذاكرة الذكية</span>
                <div className="bg-white text-[#1B3A6B] p-2 rounded-xl shadow-sm border border-[#E5E7EB]"><Lock size={14} /></div>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed font-bold">سأحتفظ هنا بجميع النقاط القانونية المهمة.</p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-black text-[#1F2937]">التعليمات الخاصة</span>
                 <button onClick={() => setEditingInstructions(!editingInstructions)} className="p-2 border border-[#E5E7EB] rounded-2xl text-[#1B3A6B] hover:bg-[#E8EEF7] transition-all shadow-sm" title="تعديل التعليمات">
                   {editingInstructions ? <X size={16} /> : <Plus size={16} />}
                 </button>
               </div>
               {editingInstructions ? (
                 <div className="space-y-3">
                   <textarea
                     value={instructions}
                     onChange={e => setInstructions(e.target.value)}
                     className="w-full text-xs text-right border border-[#E5E7EB] rounded-[1.5rem] p-5 focus:border-[#1B3A6B] outline-none bg-[#F7F8FA] resize-none h-32 font-medium"
                     placeholder="تعليمات..."
                     title="مربع التعليمات"
                   />
                   <button onClick={() => setEditingInstructions(false)} className="w-full py-3 bg-[#1B3A6B] text-white text-[11px] font-black rounded-2xl hover:shadow-xl transition-all">حفظ</button>
                 </div>
               ) : (
                 <p className="text-xs text-[#6B7280] leading-relaxed font-bold opacity-80">{instructions || 'لا توجد تعليمات.'}</p>
               )}
            </div>

            {/* Files */}
            <div className="space-y-4">
               <div className="flex items-center justify-between text-right">
                 <span className="text-sm font-black text-[#1F2937]">الملفات</span>
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 border border-[#E5E7EB] rounded-2xl text-[#1B3A6B] hover:bg-[#E8EEF7] transition-all shadow-sm" title="إضافة ملف"><Plus size={16} /></button>
               </div>
               <input ref={fileInputRef} type="file" multiple className="hidden" onChange={async (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(p => [...p, ...newFiles]);
    for (const file of newFiles) {
      if (file.type.includes('pdf')) {
        const text = await extractPdfText(file);
        setPdfTexts(prev => ({ ...prev, [file.name]: text }));
      }
    }
  }} title="رفع ملف" />
               {files.length === 0 ? (
                 <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#E5E7EB] rounded-[2rem] p-8 text-center cursor-pointer hover:border-[#1B3A6B]/40 hover:bg-[#F7F8FA] transition-all group">
                   <Plus size={24} className="mx-auto mb-2 text-[#9CA3AF]" />
                   <p className="text-[10px] font-black text-[#6B7280]">أضف وثائق</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#F7F8FA] p-4 rounded-[1.5rem] border border-[#E5E7EB]">
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="p-1 px-2 hover:bg-red-50 rounded-lg text-red-300 transition-colors" title="حذف الملف" aria-label="حذف الملف"><X size={16} /></button>
                        <p className="text-[11px] font-black text-[#1F2937] truncate flex-1 px-2">{file.name}</p>
                        {pdfTexts[file.name] && (
                          <span className="text-[9px] text-green-600 font-bold mr-1">✓ محلل</span>
                        )}
                        <FileText size={18} className="text-[#1B3A6B]" />
                      </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
