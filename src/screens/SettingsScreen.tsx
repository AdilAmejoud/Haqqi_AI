import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Palette, 
  Bell, 
  Shield, 
  Sparkles, 
  CreditCard, 
  Info, 
  LogOut,
  Download,
  RefreshCw,
  Scale
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { Profile } from '../types';

// Components
import SettingsSection from '../components/settings/SettingsSection';
import ToggleSetting from '../components/settings/ToggleSetting';
import ActionSetting from '../components/settings/ActionSetting';
import InfoSetting from '../components/settings/InfoSetting';
import SelectSetting from '../components/settings/SelectSetting';
import FontSizeSetting from '../components/settings/FontSizeSetting';
import StarRating from '../components/settings/StarRating';

interface SettingsScreenProps {
  profile: Profile | null;
}

export default function SettingsScreen({ profile }: SettingsScreenProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-2xl mx-auto py-6" dir="rtl">

      {/* Back nav */}
      <div className="flex items-center gap-2 mb-8 cursor-pointer group" onClick={() => navigate(-1)}>
        <ChevronRight size={18} className="text-[#6B7280] group-hover:text-[#1B3A6B] transition-colors" />
        <span className="text-sm font-bold text-[#6B7280] group-hover:text-[#1B3A6B] transition-colors">الإعدادات</span>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#1B3A6B] rounded-full flex items-center justify-center text-white font-black text-lg shadow-inner">
             {getInitials(profile?.full_name || null)}
           </div>
           <div className="text-right">
             <p className="font-bold text-[#1F2937] text-lg leading-tight">{profile?.full_name || 'مستخدم'}</p>
            <p className="text-xs text-[#6B7280] mt-1 italic">عضو مجاني · منذ {new Date(profile?.created_at || '').toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <button className="text-xs font-bold border border-[#E5E7EB] px-4 py-2 rounded-xl text-[#1F2937] hover:bg-[#F7F8FA] hover:border-[#1B3A6B] transition-all">
          تعديل الملف الشخصي
        </button>
      </div>

      <SettingsSection title="المظهر" icon={Palette}>
        <ToggleSetting label="الوضع الداكن" sub="تفعيل المظهر الداكن للتطبيق" />
        <FontSizeSetting />
        <SelectSetting label="اللغة" value="الدارجة المغربية" />
      </SettingsSection>

      <SettingsSection title="الإشعارات" icon={Bell}>
        <ToggleSetting label="إشعارات التطبيق"          sub="تلقى تنبيهات على جهازك"    defaultOn />
        <ToggleSetting label="إشعارات البريد الإلكتروني" sub="تلقى تحديثات على بريدك"    defaultOn />
        <ToggleSetting label="الرسائل النصية (SMS)"      sub="تلقى تنبيهات هاتفية هامة" />
      </SettingsSection>

      <SettingsSection title="الخصوصية والأمان" icon={Shield}>
        <ActionSetting label="المصادقة الثنائية"   sub="إضافة أمان مضاف لحسابك"              action="تفعيل" />
        <ActionSetting label="الجلسات النشطة"      sub="إدارة الأجهزة المسجلة حالياً" />
        <ToggleSetting label="الوضع المجهول"       sub="عدم حفظ سجل المحادثات" />
        <ActionSetting label="تصدير البيانات"      sub="تحميل نسخة من بياناتك القانونية" icon={Download} />
        <ActionSetting label="حذف الحساب" danger />
      </SettingsSection>

      <SettingsSection title="المساعد الذكي" icon={Sparkles}>
        <SelectSetting label="لغة الرد المفضلة" value="الدارجة" />
        <ToggleSetting label="حفظ السجل"      sub="تخزين المحادثات للرجوع إليها مستقبلاً"            defaultOn />
        <ToggleSetting label="اقتراحات ذكية"  sub="توصيات قانونية بناء على سياقك"           defaultOn />
      </SettingsSection>

      <SettingsSection title="الحساب والاشتراك" icon={CreditCard}>
        <div className="mx-5 my-4 bg-[#1B3A6B] rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 text-right">
            <p className="text-white font-bold text-base mb-1">ترقية إلى الباقة الاحترافية</p>
            <p className="text-white/60 text-xs">استمتع بمحادثات غير محدودة وميزات حصرية</p>
          </div>
          <button className="relative z-10 bg-[#C9A84C] text-[#1B3A6B] font-black text-xs px-5 py-2.5 rounded-xl hover:bg-[#E8C96D] transition-colors shadow-lg">
            ترقية الآن
          </button>
        </div>
        <InfoSetting   label="حالة الاشتراك"    value="الباقة المجانية" badge="نشط" />
        <ActionSetting label="استعادة المشتريات" icon={RefreshCw} />
      </SettingsSection>

      <SettingsSection title="حول التطبيق" icon={Info}>
        <InfoSetting   label="إصدار التطبيق"       value="2.4.0 (Build 45)" />
        <ActionSetting label="الشروط والأحكام" />
        <ActionSetting label="سياسة الخصوصية" />
        <ActionSetting label="التواصل بالدعم الفني" />
        <StarRating />
      </SettingsSection>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 py-4 border-2 border-red-100 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
      >
        <LogOut size={18} strokeWidth={2.5} /> تسجيل الخروج ←
      </button>

      {/* Footer */}
      <div className="text-center mt-12 pb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#E8EEF7] rounded-lg flex items-center justify-center">
            <Scale size={18} className="text-[#1B3A6B]" strokeWidth={1.5} />
          </div>
          <span className="font-bold text-[#1B3A6B] text-lg">حقي</span>
          <span className="text-[#C9A84C] font-bold text-lg">AI</span>
        </div>
        <p className="text-xs text-[#6B7280] mb-4">مساعدك القانوني الذكي في جيبك</p>
        <div className="flex justify-center gap-6 mb-6">
          {['الرئيسية', 'من نحن', 'تواصل معنا', 'الخصوصية'].map(link => (
            <a key={link} className="text-xs font-bold text-[#6B7280] hover:text-[#1B3A6B] cursor-pointer transition-colors">{link}</a>
          ))}
        </div>
        <p className="text-[10px] text-[#9CA3AF] font-medium">جميع الحقوق محفوظة © 2025 حقي AI — الدار البيضاء، المغرب</p>
      </div>

    </div>
  );
}
