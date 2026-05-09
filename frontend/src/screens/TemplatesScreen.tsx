import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, LayoutTemplate, Sparkles,
  FileText, Clock, Bell
} from 'lucide-react';
import { Profile } from '../types';

interface TemplatesScreenProps {
  profile: Profile | null;
}

const COMING_SOON_TEMPLATES = [
  { label: 'عقد كراء سكني نموذجي',     category: 'الملكية العقارية' },
  { label: 'عقد عمل محدد المدة',         category: 'قانون الشغل' },
  { label: 'توكيل رسمي عام',            category: 'المسطرة المدنية' },
  { label: 'عقد شراكة تجارية',          category: 'القانون التجاري' },
  { label: 'شكاية فصل تعسفي جاهزة',    category: 'قانون الشغل' },
  { label: 'طلب نفقة نموذجي',           category: 'قانون الأسرة' },
  { label: 'مذكرة استئناف نموذجية',     category: 'المسطرة المدنية' },
  { label: 'عقد بيع سيارة',             category: 'القانون المدني' },
  { label: 'شكاية حماية المستهلك',      category: 'الحماية الاجتماعية' },
];

export default function TemplatesScreen({ profile }: TemplatesScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-8" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/documents')}
          className="p-2 hover:bg-[#E8EEF7] rounded-full text-[#6B7280] transition-colors"
        >
          <ArrowRight size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <LayoutTemplate size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
            نماذج جاهزة
          </h1>
          <p className="text-xs text-[#6B7280]">نماذج قانونية محررة مسبقاً — قريباً</p>
        </div>
      </div>

      {/* Coming soon hero card */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 flex flex-col items-center text-center">

        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-[#E8EEF7] rounded-3xl flex items-center justify-center">
            <LayoutTemplate
              size={40}
              className="text-[#1B3A6B]"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#C9A84C] rounded-full flex items-center justify-center shadow-md">
            <Clock size={14} className="text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-2 bg-[#F5EDCC] text-[#8B6914] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-pulse" />
          قيد التطوير
        </div>

        <h2 className="text-xl font-black text-[#1F2937] mb-3">
          النماذج الجاهزة قريباً
        </h2>
        <p className="text-sm text-[#6B7280] leading-relaxed max-w-md mb-8">
          نعمل على تحضير مجموعة من النماذج القانونية الجاهزة المحررة مسبقاً من طرف محامين متخصصين — ستملأ فقط الحقول الشخصية وتحمّل المستند فوراً.
        </p>

        {/* Divider */}
        <div className="w-full border-t border-[#E5E7EB] mb-8" />

        {/* Alternative CTA */}
        <p className="text-xs text-[#9CA3AF] mb-4">
          في انتظار النماذج، يمكنك توليد أي مستند بالذكاء الاصطناعي
        </p>
        <button
          onClick={() => navigate('/documents/generate')}
          className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2D4E87] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md"
        >
          <Sparkles size={16} strokeWidth={1.5} />
          توليد مستند بالذكاء الاصطناعي
        </button>
      </div>

      {/* Preview of coming templates */}
      <div>
        <p className="text-xs font-bold text-[#9CA3AF] text-right mb-3 uppercase tracking-wider">
          نماذج ستكون متاحة قريباً
        </p>
        <div className="grid grid-cols-1 gap-2">
          {COMING_SOON_TEMPLATES.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3.5 flex items-center justify-between opacity-50 select-none"
            >
              <span className="text-[10px] bg-[#F7F8FA] border border-[#E5E7EB] text-[#9CA3AF] px-2 py-0.5 rounded-lg">
                {t.category}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#6B7280] font-medium">{t.label}</span>
                <div className="w-8 h-8 bg-[#F7F8FA] rounded-xl flex items-center justify-center">
                  <FileText size={14} className="text-[#9CA3AF]" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notify me card */}
      <div className="bg-[#F5EDCC]/60 border border-[#C9A84C]/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#C9A84C]/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell size={18} className="text-[#C9A84C]" strokeWidth={1.5} />
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#1F2937] mb-0.5">
            سيتم إشعارك فور الإطلاق
          </p>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            عند إطلاق النماذج الجاهزة، ستصلك إشعارات تلقائية في التطبيق
          </p>
        </div>
      </div>

    </div>
  );
}
