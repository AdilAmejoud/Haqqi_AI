import React from 'react';
import {
  Scale,
  Briefcase,
  Home,
  Users,
  Car,
  Heart,
  ChevronLeft,
  Phone
} from 'lucide-react';
import { Profile } from '../../types';
import { useNavigate } from 'react-router-dom';

interface CitizenDashboardProps {
  greeting: string;
  profile: Profile | null;
}

const TopicCard = ({ icon: Icon, title, sub }: { icon: any, title: string, sub: string }) => (
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:border-[#1B3A6B]/30 transition-all cursor-pointer group">
    <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] flex items-center justify-center mb-3 group-hover:bg-[#E8EEF7] transition-colors">
      <Icon size={18} className="text-[#6B7280] group-hover:text-[#1B3A6B]" strokeWidth={1.5} />
    </div>
    <p className="font-bold text-[#1F2937] text-sm mb-1">{title}</p>
    <p className="text-xs text-[#6B7280]">{sub}</p>
  </div>
);

export default function CitizenDashboard({ greeting, profile }: CitizenDashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">

      {/* Hero Banner */}
      <div className="bg-[#1B3A6B] rounded-2xl p-8 text-right relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/20 text-[#C9A84C] text-xs px-3 py-1 rounded-full border border-[#C9A84C]/30 mb-3">
            <Scale size={12} /> {greeting}، {profile?.full_name}
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">واش عندك سؤال قانوني؟</h1>
          <p className="text-white/60 text-sm mb-5">سولنا بالدارجة، حنا هنا نعاونك 🤝</p>
          <button 
            onClick={() => navigate('/chat')}
            className="bg-[#C9A84C] text-[#1B3A6B] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#E8C96D] transition-colors flex items-center gap-2 w-fit"
          >
            ابدأ المحادثة
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Common Questions */}
      <div>
        <p className="text-xs font-bold text-[#6B7280] text-right mb-3 uppercase tracking-wider">أسئلة شائعة — اضغط مباشرة</p>
        <div className="space-y-2">
          {[
            { icon: Briefcase, text: 'تصرفوا قيا بلا ما يعطوني حقوقي' },
            { icon: Home,      text: 'مشكلة مع صاحب الدار' },
            { icon: Users,     text: 'سؤال على الطلاق أو النفقة' },
            { icon: Car,       text: 'مخالفة دير عليا الشرطة' },
          ].map(({ icon: Icon, text }) => (
            <button 
              key={text} 
              onClick={() => navigate('/chat')}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#1B3A6B]/30 text-right group transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-[#6B7280]" strokeWidth={1.5} />
                <span className="text-sm font-medium text-[#1F2937]">{text}</span>
              </div>
              <ChevronLeft size={16} className="text-[#6B7280] group-hover:text-[#1B3A6B] transition-transform group-hover:-translate-x-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Topic Cards */}
      <div>
        <p className="text-xs font-bold text-[#6B7280] text-right mb-3 uppercase tracking-wider">مواضيع رئيسية</p>
        <div className="grid grid-cols-2 gap-3">
          <TopicCard icon={Heart}     title="الأسرة والإرث"  sub="طلاق، نفقة، حضانة، ميراث" />
          <TopicCard icon={Briefcase} title="حقوق الشغل"     sub="فصل تعسفي، تعويضات، عقود" />
        </div>
      </div>

      {/* Community Banner */}
      <button 
        onClick={() => navigate('/community')}
        className="w-full bg-[#F5EDCC] rounded-xl p-4 flex items-center justify-between border border-[#C9A84C]/20 hover:border-[#C9A84C]/40 hover:bg-[#EBE3C1] transition-all group"
      >
        <div className="text-right">
          <p className="font-bold text-[#1B3A6B] text-sm group-hover:text-[#142A51] transition-colors">منتدى المجتمع</p>
          <p className="text-xs text-[#6B7280]">شارك تجربتك وساعد مواطنين آخرين</p>
        </div>
        <div className="text-[#1B3A6B] text-sm font-bold flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
          ادخل
          <ChevronLeft size={16} />
        </div>
      </button>

      {/* Footer line */}
      <div className="flex justify-between items-center text-xs text-[#6B7280] pt-2 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-1 font-bold text-[#1B3A6B]">
          <Phone size={14} />
          <span dir="ltr">0613-880-860</span>
        </div>
        <span className="font-medium">خط المساعدة المجانية →</span>
      </div>

    </div>
  );
}
