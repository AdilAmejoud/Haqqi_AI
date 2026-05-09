import React, { useState, useEffect } from 'react';
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
  Scale,
  X,
  Loader
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
  const [language, setLanguage] = useState('الدارجة المغربية');
  const [saving, setSaving] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editLevel, setEditLevel] = useState<Profile['legal_level']>(profile?.legal_level || 'citizen');

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '');
      setEditLevel(profile.legal_level || 'citizen');
    }
  }, [profile]);

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
        <button 
          onClick={() => setIsEditProfileOpen(true)}
          className="text-xs font-bold border border-[#E5E7EB] px-4 py-2 rounded-xl text-[#1F2937] hover:bg-[#F7F8FA] hover:border-[#1B3A6B] transition-all">
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
        <SelectSetting
          label="لغة الرد المفضلة"
          value={language}
          options={['الدارجة المغربية', 'العربية الفصحى', 'الفرنسية']}
          onChange={(val) => {
            setLanguage(val);
            localStorage.setItem('haqqi_language', val);
          }}
        />
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
        <InfoSetting   label="إصدار التطبيق"       value="1.0.0 (Beta)" />
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

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" 
            onClick={() => !saving && setIsEditProfileOpen(false)} 
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <button 
                  onClick={() => !saving && setIsEditProfileOpen(false)} 
                  className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
                <h3 className="font-bold text-[#1F2937] text-lg">تعديل الملف الشخصي</h3>
                <div className="w-5" />
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1F2937] block mb-1.5">
                    الاسم الكامل
                  </label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    className="w-full px-4 py-3 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1F2937] block mb-1.5">
                    المستوى القانوني
                  </label>
                  <select
                    value={editLevel || 'citizen'}
                    onChange={e => setEditLevel(e.target.value as Profile['legal_level'])}
                    className="w-full px-4 py-3 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm outline-none transition-all"
                  >
                    <option value="citizen">مواطن</option>
                    <option value="student">طالب حقوق</option>
                    <option value="expert">خبير قانوني</option>
                  </select>
                </div>
                
                <button
                  onClick={async () => {
                    if (!editName.trim()) return;
                    setSaving(true);
                    await supabase.from('profiles')
                      .update({ full_name: editName.trim(), legal_level: editLevel })
                      .eq('id', profile?.id);
                    window.location.reload();
                  }}
                  disabled={!editName.trim() || saving}
                  className="w-full bg-[#1B3A6B] hover:bg-[#2D4E87] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-6"
                >
                  {saving ? (
                    <><Loader size={16} className="animate-spin" strokeWidth={1.5} /> جاري الحفظ...</>
                  ) : (
                    'حفظ التعديلات'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
