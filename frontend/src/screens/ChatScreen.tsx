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
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Profile, Conversation, Message as DBMessage } from '../types';
import { supabase } from '../utils/supabase/client';
import { getSystemPrompt } from '../utils/supabase/getSystemPrompt';
import { CATEGORY_CARDS, SUGGESTED_QUESTIONS } from '../utils/constants';
import { suggestedQuestions as DATA_QUESTIONS } from '../data/suggestedQuestions';

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

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:8000';

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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [attachedPdf, setAttachedPdf] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const hasTriggeredInitial = useRef(false);

  useEffect(() => {
    const { conversationId, initialMessage } = location.state || {};
    
    // Prioritize conversationId from location state
    if (conversationId && conversationId !== selectedConvId) {
      setSelectedConvId(conversationId);
      // loadMessages is handled by the useEffect(selectedConvId)
    }

    if (initialMessage && conversationId && !hasTriggeredInitial.current) {
      hasTriggeredInitial.current = true;
      
      // Safety: Check if this conversation already has an AI response before triggering simulation on mount
      (async () => {
        const { data } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversationId)
          .eq('role', 'assistant')
          .limit(1);
        
        if (!data || data.length === 0) {
          setTimeout(() => {
            triggerAIResponse(conversationId, initialMessage);
          }, 1000);
        }
      })();
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

  const triggerAIResponse = async (convId: string, userText: string) => {
    if (isTyping) return;
    setIsTyping(true);
    setReasoningStep(0);

    // Build history from current messages
    const history = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Advance reasoning steps visually
    const stepInterval = setInterval(() => {
      setReasoningStep(prev => {
        if (prev < REASONING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch(`${BRIDGE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history,
          legal_level: profile?.legal_level ?? 'citizen',
          domain: null,
          conversation_id: convId,
          pdf_context: pdfText || null,
          pdf_filename: attachedPdf?.name || null,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiResponseText = data.reply;

      // Save AI message to Supabase
      const aiMsg = {
        conversation_id: convId,
        role: 'assistant' as const,
        content: aiResponseText,
        sources: data.sources ?? null,
      };

      const { data: savedAiMsg } = await supabase
        .from('messages')
        .insert(aiMsg)
        .select()
        .single();

      if (savedAiMsg) {
        setMessages(prev => {
          if (prev.some(m => m.id === savedAiMsg.id)) return prev;
          return [...prev, savedAiMsg];
        });
      }

    } catch (error) {
      clearInterval(stepInterval);
      console.error('Bridge error:', error);

      // Save error message so user sees feedback
      const errorMsg = {
        conversation_id: convId,
        role: 'assistant' as const,
        content: 'عفواً، حدث خطأ في الاتصال. تأكد أن الخادم شغال على المنفذ 8000.',
        sources: null,
      };
      const { data: savedErr } = await supabase
        .from('messages').insert(errorMsg).select().single();
      if (savedErr) setMessages(prev => [...prev, savedErr]);

    } finally {
      setIsTyping(false);
    }
  };

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
    const { data: savedMsg } = await supabase.from('messages').insert({
      conversation_id: conv.id,
      role: 'user',
      content: questionText,
    }).select().single();

    if (savedMsg) {
      setMessages([savedMsg]);
    }
    
    setSelectedConvId(conv.id);
    triggerAIResponse(conv.id, questionText);
  };

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
    if (convId) {
      triggerAIResponse(convId, text);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConvId) return;
    
    const confirmed = window.confirm('هل أنت متأكد من حذف هذه المحادثة؟');
    if (!confirmed) return;

    const { error } = await supabase
      .from('conversations')
      .update({ is_archived: true })
      .eq('id', selectedConvId);

    if (error) {
      console.error('Error deleting conversation:', error);
      alert('حدث خطأ أثناء الحذف. حاول مرة أخرى.');
      return;
    }

    navigate('/chats');
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('المتصفح ديالك ما كيدعمش التعرف على الصوت. استخدم Chrome أو Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'ar-MA';        // Moroccan Arabic first
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('خاصك تسمح للمتصفح بالوصول للميكروفون');
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const isEmpty = messages.length === 0;

  const renderMessageContent = (content: string, isAi: boolean) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    // Inline markdown: **bold** and *italic*
    const renderInline = (text: string, key: string | number) => {
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <span key={key}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**'))
              return <strong key={j} className={isAi ? 'font-bold text-[#1B3A6B]' : 'font-bold text-white'}>{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*'))
              return <em key={j} className="italic opacity-90">{part.slice(1, -1)}</em>;
            return part;
          })}
        </span>
      );
    };

    // Check if a line is a table row
    const isTableRow = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|');
    const isSeparatorRow = (line: string) => /^\|[\s\-:|]+\|$/.test(line.trim().replace(/\|[\s\-:|]+/g, '|---'));

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line → spacer
      if (trimmed === '') {
        elements.push(<div key={i} className="h-2" />);
        i++;
        continue;
      }

      // # H1 — largest heading
      if (/^#\s/.test(trimmed)) {
        const text = trimmed.replace(/^#\s*/, '');
        elements.push(
          <p key={i} className={`text-sm font-black mt-4 mb-1.5 pb-1 border-b ${isAi ? 'text-[#1B3A6B] border-[#E8EEF7]' : 'text-white border-white/30'}`}>
            {renderInline(text, `h1-${i}`)}
          </p>
        );
        i++; continue;
      }

      // ## H2 — section heading
      if (/^##\s/.test(trimmed) && !trimmed.startsWith('###')) {
        const text = trimmed.replace(/^##\s*/, '');
        elements.push(
          <div key={i} className={`flex items-center gap-1.5 mt-3 mb-1`}>
            <div className={`w-0.5 h-4 rounded-full flex-shrink-0 ${isAi ? 'bg-[#1B3A6B]' : 'bg-white/60'}`} />
            <p className={`text-sm font-extrabold ${isAi ? 'text-[#1B3A6B]' : 'text-white'}`}>
              {renderInline(text, `h2-${i}`)}
            </p>
          </div>
        );
        i++; continue;
      }

      // ### H3 — subheading
      if (trimmed.startsWith('###')) {
        const text = trimmed.replace(/^###\s*/, '');
        elements.push(
          <div key={i} className={`flex items-center gap-1.5 mt-2.5 mb-0.5`}>
            <div className={`h-3 w-px flex-shrink-0 ${isAi ? 'bg-[#1B3A6B]/50' : 'bg-white/50'}`} />
            <span className={`text-sm font-bold ${isAi ? 'text-[#2D4E87]' : 'text-white/90'}`}>
              {renderInline(text, `h3-${i}`)}
            </span>
          </div>
        );
        i++; continue;
      }

      // Markdown table block
      if (isTableRow(trimmed)) {
        const headerCells = trimmed.slice(1, -1).split('|').map(c => c.trim());
        const tableRows: string[][] = [];
        i++;

        // Skip separator row (--- | --- |)
        if (i < lines.length && /^[\|\s\-:]+$/.test(lines[i])) i++;

        // Collect data rows
        while (i < lines.length && isTableRow(lines[i].trim())) {
          tableRows.push(lines[i].trim().slice(1, -1).split('|').map(c => c.trim()));
          i++;
        }

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`${isAi ? 'bg-[#1B3A6B]' : 'bg-white/20'}`}>
                  {headerCells.map((cell, j) => (
                    <th key={j} className="px-4 py-2.5 text-right font-bold text-white text-xs whitespace-nowrap">
                      {renderInline(cell, `th-${j}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri} className={`border-t border-[#E5E7EB] ${ri % 2 === 0 ? 'bg-white' : 'bg-[#F7F8FA]'}`}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-2.5 text-right leading-relaxed ${isAi ? 'text-[#374151]' : 'text-white/90'}`}>
                        {renderInline(cell, `td-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Bullet list block (lines starting with - or •)
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('• '))) {
          items.push(lines[i].trim().replace(/^[-•]\s*/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-1.5 space-y-1 pr-1">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm leading-relaxed">
                <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAi ? 'bg-[#1B3A6B]' : 'bg-white/70'}`} />
                <span className={isAi ? 'text-[#374151]' : 'text-white/95'}>{renderInline(item, j)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Numbered list block
      if (/^\d+\.\s/.test(trimmed)) {
        const items: { num: number; text: string }[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          const match = lines[i].trim().match(/^(\d+)\.\s*(.*)/);
          if (match) items.push({ num: parseInt(match[1]), text: match[2] });
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-1.5 space-y-1.5 pr-1">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <span className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black ${isAi ? 'bg-[#E8EEF7] text-[#1B3A6B]' : 'bg-white/20 text-white'}`}>
                  {item.num}
                </span>
                <span className={isAi ? 'text-[#374151]' : 'text-white/95'}>{renderInline(item.text, j)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={i} className={`text-sm leading-relaxed mb-0.5 ${isAi ? 'text-[#1F2937]' : 'text-white'}`}>
          {renderInline(trimmed, i)}
        </p>
      );
      i++;
    }

    return <div className="space-y-0.5">{elements}</div>;
  };



  const extractPdfText = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          // Use the exact version installed (5.7.284)
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs';
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let text = '';
          for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it: any) => it.str).join(' ') + '\n';
          }
          resolve(text.slice(0, 12000));
        } catch (err) {
          console.error('Error extracting PDF text:', err);
          resolve('');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handlePdfAttach = async (file: File) => {
    if (!file.type.includes('pdf')) {
      alert('فقط ملفات PDF مدعومة');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الملف يتجاوز 10MB');
      return;
    }
    setPdfLoading(true);
    setAttachedPdf(file);
    const text = await extractPdfText(file);
    setPdfText(text);
    setPdfLoading(false);
  };

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
        
        <div className="flex items-center gap-3">
          {selectedConvId && (
            <button
              onClick={handleDeleteConversation}
              className="p-2 text-[#6B7280] hover:text-red-500 transition-colors"
              title="حذف المحادثة"
            >
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          )}
          <button
            onClick={() => navigate('/chats')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#1B3A6B] transition-colors"
          >
            <span>كل المحادثات</span>
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
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
              {CATEGORY_CARDS.map((card) => (
                <button 
                  key={card.id} 
                  onClick={() => startConversationWithQuestion(card.openingMessage)}
                  className="p-5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#1B3A6B] hover:shadow-lg hover:shadow-[#1B3A6B]/5 transition-all text-center group flex flex-col items-center justify-center min-h-[110px]"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors bg-[#F7F8FA] group-hover:bg-[#E8EEF7]`}>
                    <card.icon size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-bold text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors">{card.label}</span>
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
                    {renderMessageContent(msg.content, msg.role === 'assistant')}
                  </div>
                  {msg.role === 'assistant' && msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 justify-end">
                      {msg.sources.slice(0, 3).map((s: any, i: number) => (
                        <span
                          key={i}
                          className="text-[9px] bg-[#E8EEF7] text-[#1B3A6B] px-2 py-0.5 rounded-full font-medium"
                        >
                          {s.law?.slice(0, 30)}
                        </span>
                      ))}
                    </div>
                  )}
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
            {attachedPdf && (
              <div className="absolute -top-14 right-0 left-0 flex items-center justify-between bg-[#E8EEF7] border border-[#1B3A6B]/20 rounded-xl py-2 px-3">
                <button
                  onClick={() => { setAttachedPdf(null); setPdfText(''); }}
                  className="text-[#6B7280] hover:text-red-500 transition-colors"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#1B3A6B] font-bold truncate max-w-[200px]">
                    {attachedPdf.name}
                  </span>
                  <FileText size={13} className="text-[#1B3A6B]" strokeWidth={1.5} />
                </div>
              </div>
            )}
            {isListening && (
              <div className="absolute -top-8 right-0 left-0 flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-lg py-1 px-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-600 font-medium">جاري الاستماع... تكلم الآن</span>
              </div>
            )}
            <input 
              ref={inputRef}
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={attachedPdf ? `اسأل عن "${attachedPdf.name}"...` : 'اكتب سؤالك بالدارجة...'} 
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
              <button
                onClick={startVoice}
                className={`p-2 transition-colors ${
                  isListening
                    ? 'text-red-500 animate-pulse'
                    : 'text-[#6B7280] hover:text-[#1B3A6B]'
                }`}
                title={isListening ? 'جاري الاستماع...' : 'تحدث بالصوت'}
              >
                <Mic size={20} strokeWidth={1.5} />
              </button>
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handlePdfAttach(e.target.files[0])}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 transition-colors ${
                    attachedPdf
                      ? 'text-[#1B3A6B]'
                      : 'text-[#6B7280] hover:text-[#1B3A6B]'
                  }`}
                  title="إرفاق PDF"
                >
                  {pdfLoading
                    ? <Loader size={20} strokeWidth={1.5} className="animate-spin" />
                    : <Paperclip size={20} strokeWidth={1.5} />}
                </button>
              </>
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
