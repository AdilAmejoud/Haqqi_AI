import React from 'react';
import { Construction } from 'lucide-react';
import { Profile } from '../types';

interface CommunityScreenProps {
  profile: Profile | null;
}

export default function CommunityScreen({ profile }: CommunityScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center" dir="rtl">
      <div className="bg-white p-10 rounded-2xl border border-[#E5E7EB] shadow-sm max-w-md w-full relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F5EDCC] rounded-full blur-2xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#1B3A6B] rounded-full blur-2xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#F5EDCC] rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
            <Construction size={32} strokeWidth={1.5} className="text-[#C9A84C]" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#1F2937] mb-3">
            منتدى المجتمع
          </h1>
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#C9A84C] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse"></span>
            قيد التطوير
          </div>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
            نحن نعمل بجد لإطلاق منتدى المجتمع قريباً. ستتمكن هنا من مشاركة تجاربك، وطرح استفساراتك، ومساعدة مواطنين آخرين في بيئة آمنة وداعمة.
          </p>
        </div>
      </div>
    </div>
  );
}
