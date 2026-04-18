import React from 'react';
import {
  Users,
  AlertCircle,
  Briefcase,
  Sparkles,
  Lightbulb,
  Scale,
  FileEdit,
  FileText,
  Plus,
  ChevronLeft
} from 'lucide-react';
import { Profile } from '../../types';

interface ExpertDashboardProps {
  greeting: string;
  profile: Profile | null;
}

export default function ExpertDashboard({ greeting, profile }: ExpertDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-right">
          <h1 className="text-xl font-bold text-[#1F2937]">لوحة المحامي</h1>
          <p className="text-xs text-[#6B7280]">إدارة القضايا · صياغة العقود · تحليل المستندات</p>
        </div>
        <div>
          {/* Empty spacer to keep justify-between working as expected if needed, or remove justify-between and use text-right */}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,       value: 4, label: 'موكلون',        color: '#1B3A6B' },
          { icon: AlertCircle, value: 2, label: 'قضايا جارية',  color: '#C9A84C' },
          { icon: Briefcase,   value: 4, label: 'إجمالي القضايا', color: '#1B3A6B' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center shadow-sm">
            <stat.icon size={20} style={{ color: stat.color }} strokeWidth={1.5} className="mx-auto mb-2" />
            <p className="text-2xl font-black text-[#1F2937]">{stat.value}</p>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Tools */}
      <div>
        <div className="flex items-center gap-2 mb-4 justify-end">
          <span className="text-sm font-bold text-[#1F2937]">أدوات الذكاء الاصطناعي</span>
          <Sparkles size={16} className="text-[#C9A84C]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Lightbulb, label: 'اقتراح استراتيجية' },
            { icon: Scale,     label: 'تحليل قانوني' },
            { icon: FileEdit,  label: 'مذكرة دفاع' },
            { icon: FileText,  label: 'صياغة عقد' },
          ].map(tool => (
            <button key={tool.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center hover:border-[#1B3A6B]/40 hover:bg-[#E8EEF7] transition-all group">
              <tool.icon size={24} className="text-[#1B3A6B] mx-auto mb-2 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <p className="text-[11px] text-[#1F2937] font-bold">{tool.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Case Management */}
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['الكل', 'جديدة', 'جارية', 'مكتملة'].map((tab, i) => (
              <button key={tab} className={`text-[11px] px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                i === 0 ? 'bg-[#1B3A6B] text-white shadow-md' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1B3A6B]/30'
              }`}>{tab}</button>
            ))}
          </div>
          <span className="text-sm font-bold text-[#1F2937] self-end sm:self-center">إدارة القضايا</span>
        </div>

        <div className="space-y-2">
          {[
            { title: 'فصل تعسفي — مخالفة م. 43 م.ش.',  status: 'جارية',  statusColor: 'text-[#C9A84C] bg-[#F5EDCC]', client: 'محمد الأمين',        ref: 'C-8821', date: '25 أبريل', dot: '#C9A84C' },
            { title: 'نزاع عقاري — ق.ل.ع الفصل 489',   status: 'جديدة',  statusColor: 'text-[#1B3A6B] bg-[#E8EEF7]', client: 'شركة أطلس للتجارة', ref: 'C-9134', date: 'اليوم',    dot: '#1B3A6B' },
            { title: 'قضية أسرية — النفقة والحضانة',    status: 'جارية',  statusColor: 'text-[#C9A84C] bg-[#F5EDCC]', client: 'فاطمة الزهراء',     ref: 'C-7742', date: '30 أبريل', dot: '#C9A84C' },
            { title: 'طعن إداري — قرار إداري',           status: 'مكتملة', statusColor: 'text-[#1D9E75] bg-[#EAF3DE]', client: 'يوسف بنعلي',        ref: 'C-6610', date: '10 أبريل', dot: '#1D9E75' },
          ].map(c => (
            <div key={c.ref} className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-4 flex items-center justify-between hover:border-[#1B3A6B]/30 transition-all cursor-pointer shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${c.statusColor}`}>{c.status}</span>
                <ChevronLeft size={16} className="text-[#E5E7EB] group-hover:text-[#1B3A6B] transition-all group-hover:-translate-x-1" />
              </div>
              <div className="text-right flex-1 mr-4">
                <p className="text-sm font-bold text-[#1F2937] group-hover:text-[#1B3A6B] transition-colors">{c.title}</p>
                <p className="text-[11px] text-[#6B7280]">{c.client} · <span dir="ltr">{c.ref}</span> · جلسة: {c.date}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-4 border-2 border-dashed border-[#E5E7EB] rounded-xl text-sm font-bold text-[#6B7280] hover:border-[#1B3A6B]/40 hover:text-[#1B3A6B] hover:bg-[#F7F8FA] transition-all flex items-center justify-center gap-2">
          <Plus size={18} strokeWidth={2.5} /> إضافة قضية جديدة
        </button>
      </div>

    </div>
  );
}
