import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  ArrowRight, 
  Briefcase, 
  Users, 
  Home, 
  Scale, 
  Shield, 
  FileText, 
  Heart, 
  Zap, 
  Send,
  MessageSquare,
  Maximize2,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../utils/supabase/client';

interface LibraryScreenProps {
  profile: Profile | null;
}

interface LawDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  pdf_url: string;
  law_number: string;
  year: number;
  tags: string[];
}

const CATEGORIES = [
  { id: 'labor', label: 'قانون الشغل', Icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'family', label: 'قانون الأسرة', Icon: Users, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'property', label: 'الملكية العقارية', Icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'commercial', label: 'القانون التجاري', Icon: Scale, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'criminal', label: 'القانون الجنائي', Icon: Shield, color: 'text-slate-600', bg: 'bg-slate-100' },
  { id: 'admin', label: 'المساطر الإدارية', Icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'social', label: 'الحماية الاجتماعية', Icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'digital', label: 'القانون الرقمي', Icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

// ── TEMPORARY MOCK DATA — remove once Supabase table is populated ──
const MOCK_DOCS: LawDocument[] = [
  {
    id: 'mock-1',
    title: 'مدونة الشغل — القانون رقم 65.99',
    description: 'يُنظّم هذا القانون علاقات الشغل بين المشغلين والأجراء، ويحدد الحقوق والواجبات المتبادلة من أجر وإجازة وفصل وتعويض.',
    category: 'labor',
    pdf_url: 'https://www.ilo.org/dyn/natlex/docs/SERIAL/65519/56791/F-1553454084/MAR65519.pdf',
    law_number: 'ظهير شريف رقم 1.03.194',
    year: 2003,
    tags: ['عقد الشغل', 'الفصل التعسفي', 'الأجر', 'الإجازة'],
  },
  {
    id: 'mock-2',
    title: 'مدونة الأسرة — قانون الأحوال الشخصية',
    description: 'تُنظّم مدونة الأسرة الزواج والطلاق والحضانة والنفقة والميراث وفق أحكام الشريعة الإسلامية والمقتضيات القانونية الحديثة.',
    category: 'family',
    pdf_url: '',
    law_number: 'ظهير شريف رقم 1.04.22',
    year: 2004,
    tags: ['الزواج', 'الطلاق', 'الحضانة', 'النفقة'],
  },
  {
    id: 'mock-3',
    title: 'القانون رقم 08.39 المتعلق بنظام الضمان الاجتماعي',
    description: 'يُحدد هذا القانون حقوق المؤمَّن عليهم في التقاعد والمرض والعجز وتعويضات العائلة ضمن صندوق الضمان الاجتماعي.',
    category: 'social',
    pdf_url: '',
    law_number: 'القانون رقم 08.39',
    year: 2008,
    tags: ['التقاعد', 'المرض', 'CNSS', 'التأمين'],
  },
  {
    id: 'mock-4',
    title: 'القانون التجاري — القانون رقم 15.95',
    description: 'يُنظّم النشاط التجاري ويُحدد الوضع القانوني للتاجر والشركات التجارية والسجل التجاري والمحل التجاري.',
    category: 'commercial',
    pdf_url: '',
    law_number: 'القانون رقم 15.95',
    year: 1996,
    tags: ['التاجر', 'الشركات', 'السجل التجاري', 'الإفلاس'],
  },
  {
    id: 'mock-5',
    title: 'قانون المسطرة الجنائية — القانون رقم 01.22',
    description: 'يُنظّم هذا القانون الإجراءات الجنائية من التحقيق والاعتقال والمحاكمة والطعن في الأحكام الجنائية.',
    category: 'criminal',
    pdf_url: '',
    law_number: 'القانون رقم 01.22',
    year: 2002,
    tags: ['الاعتقال', 'المحاكمة', 'الطعن', 'البراءة'],
  },
  {
    id: 'mock-6',
    title: 'قانون حماية المعطيات الشخصية رقم 09.08',
    description: 'يُرسي هذا القانون حماية المعطيات ذات الطابع الشخصي ويُحدد حقوق الأشخاص تجاه معالجة بياناتهم الرقمية.',
    category: 'digital',
    pdf_url: '',
    law_number: 'القانون رقم 09.08',
    year: 2009,
    tags: ['البيانات الشخصية', 'الخصوصية', 'CNDP', 'الرقمي'],
  },
];

export default function LibraryScreen({ profile }: LibraryScreenProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLaw, setSelectedLaw] = useState<LawDocument | null>(null);

  const [docs, setDocs] = useState<LawDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setDocs([]);
    setPage(0);
    fetchDocs(0, true);
  }, [searchQuery, selectedCategory]);

  // Maps English filter-pill ids → Arabic values stored in the DB
  const CATEGORY_DB: Record<string, string> = {
    labor: 'قانون الشغل',
    family: 'قانون الأسرة',
    property: 'الملكية العقارية',
    commercial: 'القانون التجاري',
    criminal: 'القانون الجنائي',
    admin: 'المساطر الإدارية',
    social: 'الحماية الاجتماعية',
    digital: 'القانون الرقمي',
  };

  async function fetchDocs(pageNum: number, reset = false) {
    if (reset) setLoading(true);

    let query = supabase
      .from('law_documents')
      .select('*', { count: 'exact' })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);
    if (selectedCategory !== 'all') {
      const dbCategory = CATEGORY_DB[selectedCategory] ?? selectedCategory;
      query = query.eq('category', dbCategory);
    }
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    const { data, count } = await query;
    const newDocs = data ?? [];
    setTotal(count ?? 0);
    setDocs(prev => reset ? newDocs : [...prev, ...newDocs]);
    setHasMore(newDocs.length === PAGE_SIZE);
    setLoading(false);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchDocs(next);
  }

  // Map docs to the same shape the grid expects
  const filtered = docs;

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#E8EEF7] rounded-full text-[#6B7280] transition-colors">
          <ArrowRight size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <BookOpen size={20} className="text-[#1B3A6B]" />
            مكتبة الأوامر القانونية
          </h1>
          <p className="text-xs text-[#6B7280]">أوامر جاهزة لمساعدتك في الحصول على أفضل استشارة</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="relative group">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1B3A6B] transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأوامر القانونية... (مثال: طلاق، عقد كراء)" 
            className="w-full pr-12 pl-4 py-3.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm transition-all outline-none"
            dir="rtl"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-[#1B3A6B] text-white' : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#E8EEF7]'}`}
          >
            الكل
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-[#1B3A6B] text-white' : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#E8EEF7]'}`}
            >
              <cat.Icon size={14} strokeWidth={1.5} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8EEF7]" />
                </div>
                <div className="h-4 bg-[#E8EEF7] rounded mb-2 w-3/4" />
                <div className="h-3 bg-[#E8EEF7] rounded mb-1 w-full" />
                <div className="h-3 bg-[#E8EEF7] rounded mb-4 w-2/3" />
                <div className="flex gap-1.5 mb-5">
                  <div className="h-4 w-12 bg-[#E8EEF7] rounded-md" />
                  <div className="h-4 w-16 bg-[#E8EEF7] rounded-md" />
                </div>
                <div className="h-9 bg-[#E8EEF7] rounded-xl mt-auto" />
              </div>
            ))
          : filtered.map(doc => (
              <div key={doc.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#1B3A6B]/30 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8EEF7] flex items-center justify-center">
                    <FileText size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
                  </div>
                </div>
                
                <h3 className="font-bold text-[#1F2937] text-sm mb-2">{doc.title}</h3>
                <p className="text-[11px] text-[#C9A84C] font-medium mb-2">{doc.law_number}{doc.year ? ` — ${doc.year}` : ''}</p>
                <p className="text-xs text-[#6B7280] leading-relaxed flex-1 mb-4">{doc.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {doc.tags?.map((tag, i) => (
                    <span key={`${doc.id}-${tag}-${i}`} className="text-[10px] font-bold bg-[#E8EEF7] text-[#1B3A6B] px-2 py-0.5 rounded-md">#{tag}</span>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedLaw(doc)}
                  className="w-full bg-[#1B3A6B] hover:bg-[#2D4E87] text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={14} className="rotate-180" />
                  استخدم هذا الأمر
                </button>
              </div>
            ))
        }
      </div>

      {hasMore && docs.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-all"
          >
            تحميل المزيد ({docs.length} / {total})
          </button>
        </div>
      )}

      {selectedLaw && (
        <LawDetailPanel
          law={selectedLaw}
          onClose={() => setSelectedLaw(null)}
          onConsult={(law) => {
            setSelectedLaw(null);
            navigate('/chat', {
              state: {
                initialPrompt: `اشرح لي ${law.title} — أهم الفصول والحقوق العملية بالدارجة`,
                domain: law.category,
              }
            });
          }}
        />
      )}

    </div>
  );
}

function LawDetailPanel({ law, onClose, onConsult }: {
  law: LawDocument;
  onClose: () => void;
  onConsult: (law: LawDocument) => void;
}) {
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:8000';

  // Reset loading state whenever the user opens a different law
  useEffect(() => {
    setPdfLoading(true);
  }, [law.id]);

  const fetchSummary = async () => {
    if (summary) return; // already loaded
    setSummaryLoading(true);
    try {
      const response = await fetch(`${BRIDGE_URL}/summarize-law`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: law.title,
          law_number: law.law_number,
          category: law.category,
          description: law.description,
          tags: law.tags,
        }),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch {
      setSummary('ما قدرناش نجيب الملخص — تأكد أن الخادم شغال');
    } finally {
      setSummaryLoading(false);
    }
  };

  const categoryLabel: Record<string, string> = {
    labor: 'قانون الشغل',
    family: 'قانون الأسرة',
    property: 'الملكية العقارية',
    commercial: 'القانون التجاري',
    criminal: 'القانون الجنائي',
    admin: 'المساطر الإدارية',
    social: 'الحماية الاجتماعية',
    digital: 'القانون الرقمي',
  };
  const displayCategory = categoryLabel[law.category] ?? law.category;

  const pdfSrc = law.pdf_url
    ? law.pdf_url.includes('adala.justice.gov.ma')
      ? law.pdf_url
      : `https://docs.google.com/viewer?url=${encodeURIComponent(law.pdf_url)}&embedded=true`
    : '';

  return (
    <>
      {/* Backdrop — clicking anywhere here closes the panel */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Centering wrapper — clicking the padding area also closes */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal card — stop propagation so clicking inside doesn't close */}
        <div
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex"
          style={{ width: '94vw', maxWidth: '1300px', height: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Floating close button (Top Left) */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-md text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-50 transition-all text-xl leading-none"
            title="إغلاق"
          >
            ✕
          </button>

          {/* LEFT — Metadata sidebar (hidden in fullscreen) */}
          {!pdfFullscreen && (
            <div className="w-80 flex-shrink-0 bg-white border-l border-[#E5E7EB] flex flex-col overflow-y-auto p-6 relative z-10" dir="rtl">
              <div className="flex flex-col items-end mb-4">
                <div className="w-12 h-12 bg-[#E8EEF7] rounded-2xl flex items-center justify-center mb-3">
                  <FileText size={22} className="text-[#1B3A6B]" strokeWidth={1.5} />
                </div>
                <h2 className="font-bold text-[#1F2937] text-base text-right leading-snug mb-2">{law.title}</h2>
                <span className="text-[10px] font-bold bg-[#E8EEF7] text-[#1B3A6B] px-2.5 py-1 rounded-lg">{displayCategory}</span>
                {law.law_number && <p className="text-[11px] text-[#C9A84C] font-semibold mt-2">{law.law_number}</p>}
                {law.year && <p className="text-[11px] text-[#6B7280]">{law.year}</p>}
              </div>

              {law.description && (
                <>
                  <div className="border-t border-[#E5E7EB] my-4" />
                  <p className="text-xs text-[#6B7280] text-right leading-relaxed">{law.description}</p>
                </>
              )}

              {law.tags?.length > 0 && (
                <>
                  <div className="border-t border-[#E5E7EB] my-4" />
                  <p className="text-[10px] text-[#9CA3AF] text-right mb-2 font-medium">الكلمات المفتاحية</p>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {law.tags.map((tag, i) => (
                      <span key={`${law.id}-${tag}-${i}`} className="text-[10px] font-bold bg-[#E8EEF7] text-[#1B3A6B] px-2 py-0.5 rounded-md">#{tag}</span>
                    ))}
                  </div>
                </>
              )}

              {/* Summary section */}
              <div className="border-t border-[#E5E7EB] my-4" />
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={fetchSummary}
                  disabled={summaryLoading}
                  className="text-[10px] text-[#1B3A6B] font-bold hover:underline disabled:opacity-50"
                >
                  {summaryLoading ? 'جاري التلخيص...' : summary ? 'تم التلخيص ✓' : 'ملخص بالدارجة ←'}
                </button>
                <p className="text-[10px] text-[#9CA3AF] font-medium">ملخص ذكي</p>
              </div>
              {summaryLoading && (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-3 h-3 border border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-[#6B7280]">حقي كيقرأ القانون...</span>
                </div>
              )}
              {summary && !summaryLoading && (
                <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 text-[11px] text-[#1F2937] leading-relaxed text-right">
                  {summary}
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto pt-6 flex flex-col gap-2">
                <div className="border-t border-[#E5E7EB] mb-4" />
                <button
                  onClick={() => onConsult(law)}
                  className="w-full bg-[#1B3A6B] hover:bg-[#2D4E87] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare size={14} strokeWidth={1.5} />
                  استشر حقي بهذا القانون
                </button>
                <button
                  onClick={() => law.pdf_url && window.open(law.pdf_url, '_blank')}
                  disabled={!law.pdf_url}
                  className="w-full bg-white border border-[#E5E7EB] hover:border-[#1B3A6B] text-[#1F2937] text-xs py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                  تحميل القانون PDF
                </button>
              </div>
              <p className="text-[9px] text-[#9CA3AF] text-right mt-4">المصدر: بوابة عدالة — وزارة العدل</p>
            </div>
          )}

          {/* RIGHT — PDF viewer */}
          <div className="flex-1 overflow-hidden bg-[#E8E8E8] relative flex flex-col">

            {/* Floating Fullscreen button */}
            <button
              onClick={() => setPdfFullscreen(f => !f)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-md text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-50 transition-all"
              title={pdfFullscreen ? 'إظهار التفاصيل' : 'عرض مكبّر'}
            >
              {pdfFullscreen
                ? <Minimize2 size={18} strokeWidth={1.5} />
                : <Maximize2 size={18} strokeWidth={1.5} />}
            </button>

            {pdfSrc ? (
              <div className="relative flex-1 overflow-hidden flex flex-col">
                {/* Loading spinner overlay */}
                {pdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0F2F5] z-10">
                    <div className="w-8 h-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-[#6B7280] mb-5" dir="rtl">جاري تحميل الوثيقة...</p>
                    <a
                      href={law.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#1B3A6B] hover:bg-[#2D4E87] text-white text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow"
                    >
                      <ExternalLink size={13} strokeWidth={1.5} />
                      فتح PDF في تبويب جديد
                    </a>
                  </div>
                )}

                {/* The PDF iframe */}
                <iframe
                  src={pdfSrc}
                  className="w-full flex-1 border-0"
                  title={law.title}
                  onLoad={() => setPdfLoading(false)}
                />

                {/* Always-visible fallback bar at the bottom */}
                {!pdfLoading && (
                  <div className="flex-shrink-0 bg-[#1B3A6B]/95 px-4 py-2 flex items-center justify-between" dir="rtl">
                    <p className="text-white/70 text-[10px]">إذا لم يظهر المعاينة، افتح الملف مباشرة</p>
                    <a
                      href={law.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[#C9A84C] hover:text-white text-[11px] font-bold transition-colors"
                    >
                      <ExternalLink size={11} strokeWidth={2} />
                      فتح في تبويب جديد
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white">
                <div className="w-16 h-16 bg-[#E8EEF7] rounded-2xl flex items-center justify-center mb-4">
                  <FileText size={28} className="text-[#1B3A6B]" strokeWidth={1.5} />
                </div>
                <p className="text-[#1F2937] font-semibold mb-1">النص الكامل غير متاح حالياً</p>
                <p className="text-sm text-[#6B7280]">استخدم زر استشر حقي للحصول على شرح بالدارجة</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

