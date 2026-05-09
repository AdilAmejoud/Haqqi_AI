import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  ArrowRight, 
  X,
  Scale
} from 'lucide-react';
import { Profile } from '../types';

interface DocumentScreenProps {
  profile: Profile | null;
}

const DOCUMENT_TYPES = [
  // قانون الشغل
  { id: 'warning_letter',     label: 'رسالة إنذار',              category: 'قانون الشغل' },
  { id: 'work_contract',      label: 'عقد عمل',                  category: 'قانون الشغل' },
  { id: 'dismissal_letter',   label: 'رسالة فصل',                category: 'قانون الشغل' },
  { id: 'resignation_letter', label: 'رسالة استقالة',            category: 'قانون الشغل' },
  { id: 'salary_complaint',   label: 'شكاية عدم أداء الأجر',     category: 'قانون الشغل' },
  { id: 'work_certificate',   label: 'شهادة العمل',              category: 'قانون الشغل' },
  // قانون الأسرة
  { id: 'divorce_request',    label: 'طلب طلاق',                 category: 'قانون الأسرة' },
  { id: 'alimony_request',    label: 'طلب نفقة',                 category: 'قانون الأسرة' },
  { id: 'custody_request',    label: 'طلب حضانة',               category: 'قانون الأسرة' },
  { id: 'marriage_contract',  label: 'عقد زواج',                 category: 'قانون الأسرة' },
  // الملكية العقارية
  { id: 'rental_contract',    label: 'عقد كراء سكني',            category: 'الملكية العقارية' },
  { id: 'rental_commercial',  label: 'عقد كراء تجاري',           category: 'الملكية العقارية' },
  { id: 'eviction_notice',    label: 'إشعار بالإخراج',           category: 'الملكية العقارية' },
  { id: 'sale_contract',      label: 'عقد بيع عقار',             category: 'الملكية العقارية' },
  { id: 'property_complaint', label: 'شكاية نزاع عقاري',         category: 'الملكية العقارية' },
  // القانون التجاري
  { id: 'company_statute',    label: 'نظام أساسي للشركة',        category: 'القانون التجاري' },
  { id: 'partnership',        label: 'عقد شراكة',                category: 'القانون التجاري' },
  { id: 'service_contract',   label: 'عقد خدمات',                category: 'القانون التجاري' },
  { id: 'invoice_dispute',    label: 'شكاية نزاع تجاري',         category: 'القانون التجاري' },
  { id: 'debt_recovery',      label: 'إنذار باسترداد دين',       category: 'القانون التجاري' },
  // المسطرة المدنية
  { id: 'civil_complaint',    label: 'شكاية مدنية',              category: 'المسطرة المدنية' },
  { id: 'appeal_letter',      label: 'مذكرة استئناف',            category: 'المسطرة المدنية' },
  { id: 'summons',            label: 'استدعاء للمحكمة',          category: 'المسطرة المدنية' },
  { id: 'power_of_attorney',  label: 'توكيل رسمي',               category: 'المسطرة المدنية' },
  // القانون الجنائي
  { id: 'criminal_complaint', label: 'شكاية جنائية',             category: 'القانون الجنائي' },
  { id: 'restraining_order',  label: 'طلب حماية من العنف',       category: 'القانون الجنائي' },
  { id: 'bail_request',       label: 'طلب الإفراج المؤقت',       category: 'القانون الجنائي' },
  // القانون الإداري
  { id: 'admin_complaint',    label: 'تظلم إداري',               category: 'القانون الإداري' },
  { id: 'admin_appeal',       label: 'طعن في قرار إداري',        category: 'القانون الإداري' },
  { id: 'info_request',       label: 'طلب الحصول على معلومة',    category: 'القانون الإداري' },
  { id: 'civil_servant',      label: 'شكاية موظف عمومي',         category: 'القانون الإداري' },
  // الحماية الاجتماعية
  { id: 'consumer_complaint', label: 'شكاية حماية المستهلك',     category: 'الحماية الاجتماعية' },
  { id: 'insurance_claim',    label: 'مطالبة تأمينية',           category: 'الحماية الاجتماعية' },
  { id: 'cnss_complaint',     label: 'شكاية CNSS',               category: 'الحماية الاجتماعية' },
];

const DOC_CATEGORIES = ['الكل', 'قانون الشغل', 'قانون الأسرة', 'الملكية العقارية', 'القانون التجاري', 'المسطرة المدنية', 'القانون الجنائي', 'القانون الإداري', 'الحماية الاجتماعية'];

export default function DocumentScreen({ profile }: DocumentScreenProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('warning_letter');
  const [isGenerated, setIsGenerated] = useState(false);
  const [docCategory, setDocCategory] = useState('الكل');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    secondParty: '',
    date: '',
    amount: '',
    details: ''
  });

  useEffect(() => {
    if (profile?.full_name) {
      setFormData(prev => ({ ...prev, name: profile.full_name || '' }));
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const docTitle = DOCUMENT_TYPES.find(d => d.id === activeTab)?.label ?? '';

  // Convert markdown to plain styled HTML for export
  const markdownToHtml = (md: string): string => {
    return md
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^###\s*(.+)$/gm, '<h3 style="color:#1B3A6B;font-size:13px;font-weight:800;margin:16px 0 6px;border-right:3px solid #1B3A6B;padding-right:8px;">$1</h3>')
      .replace(/^##\s*(.+)$/gm, '<h2 style="color:#1B3A6B;font-size:14px;font-weight:800;margin:18px 0 8px;border-bottom:1px solid #E8EEF7;padding-bottom:4px;">$1</h2>')
      .replace(/^#\s*(.+)$/gm, '<h1 style="text-align:center;color:#1B3A6B;font-size:18px;font-weight:900;margin:0 0 16px;padding-bottom:10px;border-bottom:2px solid #1B3A6B;">$1</h1>')
      .replace(/^---$|^\*\*\*$|^\* \* \*$/gm, '<hr style="border:none;border-top:1px solid #D1D5DB;margin:16px 0;">')
      .replace(/^- (.+)$/gm, '<li style="margin:3px 0;padding-right:4px;">$1</li>')
      .replace(/(<li.*<\/li>)/gs, '<ul style="list-style:none;padding:0;margin:8px 0;">$1</ul>')
      .replace(/\n\n/g, '</p><p style="text-align:justify;margin:6px 0;">')
      .replace(/\n/g, '<br/>');
  };

  const handleDownloadPDF = () => {
    const html = markdownToHtml(generatedContent);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${docTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
          * { box-sizing: border-box; }
          body { font-family: 'Noto Naskh Arabic', 'Arial', serif; font-size: 13px; line-height: 1.9; color: #1a1a1a; background: #fff; margin: 0; padding: 40px 60px; direction: rtl; }
          h1 { font-size: 18px; font-weight: 900; text-align: center; color: #1B3A6B; border-bottom: 2px solid #1B3A6B; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { font-size: 14px; font-weight: 800; color: #1B3A6B; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 18px 0 8px; }
          h3 { font-size: 12px; font-weight: 800; color: #1B3A6B; border-right: 3px solid #1B3A6B; padding-right: 8px; margin: 14px 0 6px; text-transform: uppercase; }
          p { text-align: justify; margin: 6px 0; }
          hr { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
          ul { list-style: none; padding: 0; margin: 8px 0; }
          li::before { content: "• "; color: #1B3A6B; }
          @media print { body { padding: 20mm 25mm; } }
        </style>
      </head>
      <body>
        <p style="text-align:justify;margin:6px 0;">${html}</p>
        <script>window.onload = () => { window.print(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
    setShowDownload(false);
  };

  const handleDownloadWord = () => {
    const html = markdownToHtml(generatedContent);
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='UTF-8'><meta name='ProgId' content='Word.Document'>
      <style>
        body { font-family: 'Arial', sans-serif; font-size: 13pt; line-height: 1.8; direction: rtl; }
        h1 { font-size: 18pt; font-weight: bold; text-align: center; color: #1B3A6B; }
        h2 { font-size: 14pt; font-weight: bold; color: #1B3A6B; }
        h3 { font-size: 12pt; font-weight: bold; color: #1B3A6B; }
        p { text-align: justify; }
      </style></head>
      <body dir='rtl'><p>${html}</p></body></html>`;
    const blob = new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'مستند'}-حقي-AI.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownload(false);
  };

  // Professional legal document renderer
  const renderDocumentContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    const renderInline = (text: string, key: string | number) => {
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <span key={key}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**'))
              return <strong key={j} className="font-bold text-[#1F2937]">{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*'))
              return <em key={j} className="italic">{part.slice(1, -1)}</em>;
            return part;
          })}
        </span>
      );
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines — add spacer
      if (trimmed === '') {
        elements.push(<div key={i} className="h-3" />);
        i++; continue;
      }

      // Horizontal rule --- or ***
      if (trimmed === '---' || trimmed === '***' || trimmed === '* * *') {
        elements.push(<hr key={i} className="my-4 border-t border-[#D1D5DB]" />);
        i++; continue;
      }

      // # Title (H1) — large centered
      if (/^#\s/.test(trimmed) && !trimmed.startsWith('##')) {
        const text = trimmed.replace(/^#\s*/, '');
        elements.push(
          <h1 key={i} className="text-center text-base font-black text-[#1B3A6B] mt-2 mb-4 pb-3 border-b-2 border-[#1B3A6B]/30 tracking-wide">
            {renderInline(text, `h1-${i}`)}
          </h1>
        );
        i++; continue;
      }

      // ## Section (H2)
      if (/^##\s/.test(trimmed) && !trimmed.startsWith('###')) {
        const text = trimmed.replace(/^##\s*/, '');
        elements.push(
          <h2 key={i} className="text-sm font-extrabold text-[#1B3A6B] mt-5 mb-2 pb-1 border-b border-[#E8EEF7]">
            {renderInline(text, `h2-${i}`)}
          </h2>
        );
        i++; continue;
      }

      // ### Article heading (البند)
      if (trimmed.startsWith('###')) {
        const text = trimmed.replace(/^###\s*/, '');
        elements.push(
          <div key={i} className="flex items-center gap-2 mt-4 mb-1.5">
            <div className="w-1 h-4 bg-[#1B3A6B] rounded-full flex-shrink-0" />
            <h3 className="text-xs font-extrabold text-[#1B3A6B] uppercase tracking-wider">
              {renderInline(text, `h3-${i}`)}
            </h3>
          </div>
        );
        i++; continue;
      }

      // Bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('• '))) {
          items.push(lines[i].trim().replace(/^[-•]\s*/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-2 space-y-1 pr-2">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-xs leading-relaxed text-[#374151]">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#1B3A6B] flex-shrink-0" />
                {renderInline(item, j)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmed)) {
        const items: { num: number; text: string }[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          const m = lines[i].trim().match(/^(\d+)\.\s*(.*)/);
          if (m) items.push({ num: parseInt(m[1]), text: m[2] });
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-2 space-y-1.5 pr-2">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-xs leading-relaxed text-[#374151]">
                <span className="font-bold text-[#1B3A6B] flex-shrink-0 w-4">{item.num}.</span>
                {renderInline(item.text, j)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Notes / ملاحظات section — light background
      if (trimmed.startsWith('**ملاحظات') || trimmed.startsWith('**نصائح') || trimmed.startsWith('**تنبيه') || trimmed.startsWith('**البيانات')) {
        const noteLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('---') && !lines[i].trim().startsWith('***')) {
          noteLines.push(lines[i].trim());
          i++;
        }
        elements.push(
          <div key={`note-${i}`} className="my-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 text-xs text-[#6B7280] leading-relaxed">
            {noteLines.map((nl, j) => (
              <p key={j} className="mb-0.5">{renderInline(nl, j)}</p>
            ))}
          </div>
        );
        continue;
      }

      // Signature lines (توقيع / ختم)
      if (trimmed.includes('توقيع') || trimmed.includes('الختم') || trimmed.includes('التوقيع')) {
        elements.push(
          <p key={i} className="text-xs font-bold text-[#1F2937] mt-1">
            {renderInline(trimmed, i)}
          </p>
        );
        i++; continue;
      }

      // Regular paragraph
      elements.push(
        <p key={i} className="text-xs leading-relaxed text-[#374151] text-justify mb-0.5">
          {renderInline(trimmed, i)}
        </p>
      );
      i++;
    }

    return <div className="font-serif space-y-0.5">{elements}</div>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#E8EEF7] rounded-full text-[#6B7280] transition-colors">
          <ArrowRight size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <FileText size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
            توليد المستندات القانونية
          </h1>
          <p className="text-xs text-[#6B7280]">صياغة احترافية للمستندات بناءً على القانون المغربي</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DOC_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setDocCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              docCategory === cat
                ? 'bg-[#1B3A6B] text-white shadow-md'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1B3A6B]/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document type selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DOCUMENT_TYPES
          .filter(d => docCategory === 'الكل' || d.category === docCategory)
          .map(doc => (
            <button
              key={doc.id}
              onClick={() => { setActiveTab(doc.id); setIsGenerated(false); setGeneratedContent(''); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === doc.id
                  ? 'bg-[#1B3A6B] text-white shadow-md'
                  : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1B3A6B]/30'
              }`}
            >
              {doc.label}
            </button>
          ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Form */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#E8EEF7]/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-[#1F2937] text-sm">بيانات المستند</h2>
                <div className="flex items-center gap-1.5 bg-[#EAF3DE] text-[#1D9E75] px-2 py-1 rounded-md text-[10px] font-bold">
                  <Sparkles size={10} /> ذكاء اصطناعي نشط
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2937]">الاسم الكامل</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-xs transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2937]">الطرف الثاني</label>
                  <input type="text" name="secondParty" value={formData.secondParty} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-xs transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2937]">التاريخ</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-xs transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2937]">المبلغ (إن وجد)</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-xs transition-all outline-none" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2937]">تفاصيل إضافية</label>
                <textarea name="details" value={formData.details} onChange={handleInputChange} rows={4} className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-xs transition-all outline-none resize-none"></textarea>
              </div>

              <button
                disabled={isLoading}
                onClick={async () => {
                  if (!formData.name.trim()) {
                    alert('من فضلك أدخل الاسم الكامل');
                    return;
                  }
                  setIsLoading(true);
                  setIsGenerated(false);
                  setGeneratedContent('');
                  const activeDoc = DOCUMENT_TYPES.find(d => d.id === activeTab);
                  try {
                    const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:8000';
                    const response = await fetch(`${BRIDGE_URL}/generate-document`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: activeDoc?.label ?? activeTab,
                        full_name: formData.name,
                        second_party: formData.secondParty || null,
                        date: formData.date || null,
                        amount: formData.amount || null,
                        details: formData.details || null,
                        legal_level: 'expert',
                      }),
                    });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const data = await response.json();
                    setGeneratedContent(data.document);
                    setIsGenerated(true);
                  } catch (error) {
                    console.error('Document generation error:', error);
                    alert('خطأ في توليد المستند. تأكد أن الخادم شغال على المنفذ 8000.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full bg-[#1B3A6B] hover:bg-[#2D4E87] disabled:opacity-60 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    توليد المستند الآن
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#F5EDCC] border border-[#C9A84C]/20 rounded-2xl p-4 flex gap-3 items-start">
            <ShieldCheck className="text-[#1B3A6B] shrink-0 mt-0.5" size={18} />
            <div className="text-right">
              <h4 className="font-bold text-[#1B3A6B] text-xs mb-1">ضمان قانوني</h4>
              <p className="text-[#6B7280] text-[10px] leading-relaxed">جميع المستندات يتم توليدها بناءً على آخر التحديثات في الجريدة الرسمية المغربية 2024.</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <h3 className="font-bold text-[#1B3A6B] text-sm flex items-center gap-2">
              <Scale size={18} strokeWidth={1.5} />
              معاينة المستند
            </h3>
            <div className="flex gap-2">
              <button disabled={!isGenerated} className="p-2 text-[#6B7280] hover:bg-[#F7F8FA] rounded-lg disabled:opacity-30 transition-colors"><Printer size={18} /></button>
              <button disabled={!isGenerated} onClick={() => setShowDownload(true)} className="p-2 text-[#6B7280] hover:bg-[#F7F8FA] rounded-lg disabled:opacity-30 transition-colors"><Download size={18} /></button>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
            <div className={`w-full h-full bg-white border border-[#F3F4F6] p-8 shadow-inner transition-opacity duration-500 ${isGenerated ? 'opacity-100' : 'opacity-20'}`}>
              {generatedContent ? (
                <div className="text-right">
                  {renderDocumentContent(generatedContent)}
                </div>
              ) : (
                <div className="space-y-6 text-[11px] leading-loose text-right">
                  <div className="text-center mb-8 border-b-2 border-[#1F2937] pb-4">
                    <h2 className="font-bold text-lg">{DOCUMENT_TYPES.find(d => d.id === activeTab)?.label}</h2>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>التاريخ: {formData.date || '..../../..'}</span>
                    <span>الرقم: HAQ-2024-001</span>
                  </div>
                  <p><span className="font-bold">إلى السيد(ة):</span> {formData.secondParty || '................................'}</p>
                  <p className="font-bold">الموضوع: {DOCUMENT_TYPES.find(d => d.id === activeTab)?.label}</p>
                  <p className="text-justify">
                    بناءً على مقتضيات القانون المغربي المعمول به، وبصفتي {formData.name || '................................'}، أتقدم إليكم بهذا المستند...
                  </p>
                  <p className="text-justify h-32 border border-dashed border-[#E5E7EB] p-4 rounded-lg bg-[#F7F8FA]">
                    {formData.details || 'سيظهر نص المستند المولد هنا بناءً على التفاصيل المدخلة...'}
                  </p>
                  <div className="pt-8 flex justify-between items-end">
                    <div className="text-center">
                      <p className="font-bold mb-8">التوقيع</p>
                      <p>........................</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold mb-8">المصادقة</p>
                      <div className="w-20 h-20 border border-[#E5E7EB] rounded-full flex items-center justify-center text-[8px] text-[#9CA3AF] italic">طابع الإدارة</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!isGenerated && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                <div className="bg-[#1B3A6B] text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-xl animate-bounce">
                  اضغط على "توليد المستند" للمعاينة
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Download Modal */}
      {showDownload && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#F3F4F6] flex justify-between items-center bg-[#F7F8FA]">
              <h3 className="font-bold text-[#1B3A6B] text-sm">تحميل المستند</h3>
              <button onClick={() => setShowDownload(false)} className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <button onClick={handleDownloadPDF} className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] hover:border-[#1B3A6B] hover:bg-[#E8EEF7] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-[10px] group-hover:bg-red-100 transition-colors">PDF</div>
                  <div className="text-right">
                    <p className="font-bold text-[#1F2937] text-sm">صيغة PDF</p>
                    <p className="text-[10px] text-[#6B7280]">للطباعة والمراسلة الرسمية</p>
                  </div>
                </div>
                <Download size={16} className="text-[#E5E7EB] group-hover:text-[#1B3A6B] transition-colors" />
              </button>
              <button onClick={handleDownloadWord} className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] hover:border-[#1B3A6B] hover:bg-[#E8EEF7] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] group-hover:bg-blue-100 transition-colors">DOCX</div>
                  <div className="text-right">
                    <p className="font-bold text-[#1F2937] text-sm">صيغة Word</p>
                    <p className="text-[10px] text-[#6B7280]">للتعديل والتحرير اليدوي</p>
                  </div>
                </div>
                <Download size={16} className="text-[#E5E7EB] group-hover:text-[#1B3A6B] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
