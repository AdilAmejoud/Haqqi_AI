import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, FolderOpen, LayoutTemplate,
  ArrowLeft, Sparkles, Clock, BookOpen
} from 'lucide-react';
import { Profile } from '../types';

interface DocumentsHubScreenProps {
  profile: Profile | null;
}

const HUB_OPTIONS = [
  {
    id: 'generate',
    path: '/documents/generate',
    icon: Sparkles,
    title: 'توليد مستند جديد',
    description: 'اصنع رسالة إنذار، عقد عمل، شكاية، توكيل — بالذكاء الاصطناعي في ثوانٍ',
    badge: '33 نوع مستند',
    badgeColor: 'bg-[#E8EEF7] text-[#1B3A6B]',
    cta: 'ابدأ التوليد',
    accent: '#1B3A6B',
  },
  {
    id: 'saved',
    path: '/documents/saved',
    icon: FolderOpen,
    title: 'مستنداتي المحفوظة',
    description: 'استعرض وحمّل جميع المستندات التي ولّدتها سابقاً',
    badge: 'السجل الشخصي',
    badgeColor: 'bg-[#F5EDCC] text-[#8B6914]',
    cta: 'عرض المستندات',
    accent: '#C9A84C',
  },
  {
    id: 'templates',
    path: '/documents/templates',
    icon: LayoutTemplate,
    title: 'نماذج جاهزة',
    description: 'نماذج قانونية محررة مسبقاً — املأ الحقول فقط وحمّل فوراً',
    badge: 'قريباً',
    badgeColor: 'bg-[#F7F8FA] text-[#9CA3AF]',
    cta: 'استعرض النماذج',
    accent: '#6B7280',
  },
];

export default function DocumentsHubScreen({ profile }: DocumentsHubScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-8" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#1F2937] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E8EEF7] rounded-2xl flex items-center justify-center">
            <FileText size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
          </div>
          المستندات القانونية
        </h1>
        <p className="text-sm text-[#6B7280] mt-1 mr-14">
          صياغة احترافية للمستندات بناءً على القانون المغربي
        </p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 gap-4">
        {HUB_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => navigate(option.path)}
            className="bg-white border border-[#E5E7EB] rounded-3xl p-6 text-right hover:border-[#1B3A6B]/30 hover:shadow-md transition-all group flex items-center gap-6"
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:scale-105 duration-200"
              style={{ backgroundColor: `${option.accent}15` }}
            >
              <option.icon
                size={28}
                strokeWidth={1.5}
                style={{ color: option.accent }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${option.badgeColor}`}
                >
                  {option.badge}
                </span>
                <h2 className="text-base font-black text-[#1F2937]">
                  {option.title}
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {option.description}
              </p>
            </div>

            {/* CTA arrow */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <span
                className="text-xs font-bold hidden group-hover:block transition-all"
                style={{ color: option.accent }}
              >
                {option.cta}
              </span>
              <ArrowLeft
                size={18}
                strokeWidth={1.5}
                className="text-[#E5E7EB] group-hover:text-[#1B3A6B] transition-colors"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-around">
        {[
          { icon: FileText, label: 'نوع مستند', value: '33' },
          { icon: BookOpen, label: 'تخصص قانوني', value: '8' },
          { icon: Clock,    label: 'متوسط التوليد', value: '15 ث' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-[#E8EEF7] rounded-xl flex items-center justify-center">
              <stat.icon size={15} className="text-[#1B3A6B]" strokeWidth={1.5} />
            </div>
            <span className="text-base font-black text-[#1F2937]">{stat.value}</span>
            <span className="text-[10px] text-[#9CA3AF]">{stat.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
