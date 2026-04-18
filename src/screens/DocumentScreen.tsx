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

const TABS = [
  { id: 'warning', label: 'رسالة إنذار' },
  { id: 'contract', label: 'عقد عمل' },
  { id: 'complaint', label: 'شكاية' },
  { id: 'petition', label: 'عريضة' }
];

export default function DocumentScreen({ profile }: DocumentScreenProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('warning');
  const [isGenerated, setIsGenerated] = useState(false);
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

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setIsGenerated(false); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[#1B3A6B] text-white shadow-md' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1B3A6B]/30'}`}
          >
            {tab.label}
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
                onClick={() => setIsGenerated(true)}
                className="w-full bg-[#1B3A6B] hover:bg-[#2D4E87] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                <FileText size={18} />
                توليد المستند الآن
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

          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-8 min-h-[500px] flex flex-col relative overflow-hidden">
            <div className={`w-full h-full bg-white border border-[#F3F4F6] p-8 shadow-inner transition-opacity duration-500 ${isGenerated ? 'opacity-100' : 'opacity-20'}`}>
              <div className="text-center mb-8 border-b-2 border-[#1F2937] pb-4">
                <h2 className="font-bold text-lg">{TABS.find(t => t.id === activeTab)?.label}</h2>
              </div>
              <div className="space-y-6 text-[11px] leading-loose text-right">
                <div className="flex justify-between font-bold">
                  <span>التاريخ: {formData.date || '..../../..'}</span>
                  <span>الرقم: HAQ-2024-001</span>
                </div>
                <p><span className="font-bold">إلى السيد(ة):</span> {formData.secondParty || '................................'}</p>
                <p className="font-bold">الموضوع: {TABS.find(t => t.id === activeTab)?.label}</p>
                <p className="text-justify">
                  بناءً على مقتضيات القانون المغربي المعمول به، وبصفتي {formData.name || '................................'}، أتقدم إليكم بهذا المستند قصد بيان الوقائع التالية:
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
              <button onClick={() => setShowDownload(false)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] hover:border-[#1B3A6B] hover:bg-[#E8EEF7] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-[10px] group-hover:bg-red-100 transition-colors">PDF</div>
                  <div className="text-right">
                    <p className="font-bold text-[#1F2937] text-sm">صيغة PDF</p>
                    <p className="text-[10px] text-[#6B7280]">للطباعة والمراسلة الرسمية</p>
                  </div>
                </div>
                <Download size={16} className="text-[#E5E7EB] group-hover:text-[#1B3A6B] transition-colors" />
              </button>
              <button onClick={() => setShowDownload(false)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] hover:border-[#1B3A6B] hover:bg-[#E8EEF7] transition-all group">
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
