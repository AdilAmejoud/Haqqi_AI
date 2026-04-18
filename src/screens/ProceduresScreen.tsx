import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  CreditCard, 
  Briefcase, 
  Users, 
  Heart, 
  ExternalLink, 
  ChevronDown, 
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { Profile } from '../types';

interface ProceduresScreenProps {
  profile: Profile | null;
}

const PROCEDURES = [
  { id: 'iqama', title: 'تجديد البطاقة الوطنية', sub: 'وثائق ومساطر الحالة المدنية', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', steps: ['صورة فوتوغرافية حديثة', 'نسخة من عقد الازدياد', 'شهادة السكنى'] },
  { id: 'cr', title: 'إنشاء مقاولة (SARL)', sub: 'مساطر الاستثمار والشركات', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50', steps: ['الشهادة السلبية', 'تحديد المقر الاجتماعي', 'تسجيل العقود'] },
  { id: 'transfer', title: 'تحويل الملكية العقارية', sub: 'المحافظة العقارية والتوثيق', icon: Users, color: 'text-green-600', bg: 'bg-green-50', steps: ['شهادة الملكية', 'عقد البيع الموثق', 'أداء الرسوم والواجبات'] },
  { id: 'marriage', title: 'توثيق عقد الزواج', sub: 'قضاء الأسرة والحالة المدنية', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', steps: ['ملف الزواج لدى المحكمة', 'شهادة طبية', 'نسخة كاملة من رسم الولادة'] },
];

export default function ProceduresScreen({ profile }: ProceduresScreenProps) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#E8EEF7] rounded-full text-[#6B7280] transition-colors">
          <ArrowRight size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <ClipboardList size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
            المساطر الإدارية
          </h1>
          <p className="text-xs text-[#6B7280]">دليلك الشامل للإجراءات الإدارية والقانونية في المغرب</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
        <div className="relative group">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1B3A6B]" />
          <input 
            type="text" 
            placeholder="ابحث عن مسطرة إدارية... (مثال: تجديد رخصة السياقة)" 
            className="w-full pr-12 pl-4 py-3.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm transition-all outline-none"
            dir="rtl"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {PROCEDURES.map(proc => (
          <div key={proc.id} className={`bg-white border transition-all overflow-hidden ${expandedId === proc.id ? 'border-[#1B3A6B] rounded-2xl ring-1 ring-[#1B3A6B]/10' : 'border-[#E5E7EB] rounded-xl hover:border-[#1B3A6B]/30 shadow-sm cursor-pointer'}`} onClick={() => setExpandedId(expandedId === proc.id ? null : proc.id)}>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${proc.bg} flex items-center justify-center`}>
                  <proc.icon size={24} className={proc.color} strokeWidth={1.5} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-[#1F2937] text-sm">{proc.title}</h3>
                  <p className="text-[11px] text-[#6B7280]">{proc.sub}</p>
                </div>
              </div>
              <ChevronDown size={18} className={`text-[#9CA3AF] transition-transform ${expandedId === proc.id ? 'rotate-180 text-[#1B3A6B]' : ''}`} />
            </div>

            {expandedId === proc.id && (
              <div className="px-5 pb-5 pt-1 border-t border-[#F3F4F6] animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold text-[#1F2937] mb-3 mt-4">الوثائق والإجراءات المطلوبة:</p>
                <ul className="space-y-2 mb-6 text-xs text-[#6B7280] pr-4 list-disc marker:text-[#1B3A6B]">
                  {proc.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#1B3A6B] hover:bg-[#2D4E87] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]">
                    <ExternalLink size={14} />
                    الموقع الرسمي للمسطرة
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/chat'); }} className="flex-1 bg-white border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#1F2937] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    توليد طلب خطي
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Help Alert */}
      <div className="bg-[#E8EEF7] border border-[#1B3A6B]/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1B3A6B] shrink-0 shadow-sm">
            <AlertTriangle size={24} strokeWidth={1.5} />
          </div>
          <div className="text-right">
            <h4 className="font-bold text-[#1B3A6B] text-sm">واش كتحس براسك تالف فالمساطر؟</h4>
            <p className="text-xs text-[#6B7280] mt-1">المساعد الذكي يقدر يرافقك خطوة بخطوة حتى تسالي غراضك.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="bg-[#1B3A6B] hover:bg-[#2D4E87] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap w-full sm:w-auto shadow-md"
        >
          بدا المحادثة دابا
        </button>
      </div>

    </div>
  );
}
