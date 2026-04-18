import React from 'react';
import { Scale, ShieldCheck, Globe, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase/client';


// ─── Google SVG Icon ──────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthScreen() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col lg:flex-row overflow-hidden" dir="rtl">
      
      {/* Decorative Left/Top Section (Premium Moroccan Feel) */}
      <div className="lg:w-1/2 bg-[#1B3A6B] relative flex flex-col items-center justify-center p-12 text-center overflow-hidden">
        {/* Subtle Geometric Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30H15L30 0zM0 30l30 15V15L0 30zm60 0L30 15v30l30-15zM30 60l-15-30h30L30 60z' fill='%23C9A84C' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="w-20 h-20 bg-[#C9A84C]/20 rounded-3xl flex items-center justify-center mb-8 border border-[#C9A84C]/30 shadow-xl">
            <Scale size={40} className="text-[#C9A84C]" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            حقي <span className="text-[#C9A84C]">AI</span>
          </h1>
          <p className="text-white/70 text-lg mb-12 leading-relaxed">
            مساعدك القانوني الذكي بالدارجة المغربية. نحمي حقوقك، ونبسط لك القانون.
          </p>

          <div className="grid grid-cols-1 gap-6 w-full text-right">
            {[
              { icon: ShieldCheck, title: 'موثوق وآمن', desc: 'معلومات مبنية على الجريدة الرسمية' },
              { icon: MessageSquare, title: 'استشارة فورية', desc: 'تكلم بالدارجة وخذ جوابك دابا' },
              { icon: Globe, title: 'متاح 24/7', desc: 'مساعدك القانوني فجيبك ديما' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center group-hover:bg-[#C9A84C]/20 transition-colors">
                  <feature.icon size={20} className="text-[#C9A84C]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{feature.title}</h3>
                  <p className="text-white/50 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 w-full">
            <p className="text-[#C9A84C] font-bold text-sm mb-1">أكثر من 10,000 استشارة ناجحة</p>
            <p className="text-white/40 text-xs">ثقة المواطنين والمهنيين المغاربة</p>
          </div>
        </div>
      </div>

      {/* Auth Card Section */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Back to Home */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 right-8 flex items-center gap-2 text-[#6B7280] hover:text-[#1B3A6B] font-bold text-sm transition-colors group"
        >
          <span>الرجوع للرئيسية</span>
          <ArrowLeft size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="w-full max-w-md">
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-10 shadow-2xl shadow-[#1B3A6B]/5">
            
            <div className="mb-10 text-center lg:text-right">
              <h2 className="text-3xl font-black text-[#1F2937] mb-3">تسجيل الدخول</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                مرحباً بك مجدداً! اختار الطريقة اللي تناسبك باش تدخل للحساب ديالك.
              </p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 bg-white border-2 border-[#E5E7EB] hover:border-[#1B3A6B]/30 hover:bg-[#F7F8FA] text-[#1F2937] font-bold py-4 rounded-2xl transition-all shadow-sm mb-8 group active:scale-[0.98]"
            >
              <span className="bg-white rounded-lg p-[3px] flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <GoogleIcon />
              </span>
              <span>المتابعة باستخدام Google</span>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-[#E5E7EB] flex-1"></div>
              <span className="text-[#9CA3AF] text-xs font-bold px-2 uppercase">حماية قانونية</span>
              <div className="h-px bg-[#E5E7EB] flex-1"></div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F7F8FA] p-5 rounded-2xl border border-transparent hover:border-[#1B3A6B]/10 transition-all">
                <p className="text-[11px] text-[#6B7280] leading-loose text-justify italic">
                  "بصفتي مستخدماً للمنصة، أقر بأن المعلومات المقدمة من طرف حقي AI هي معلومات استشارية عامة ولا تعوض رأي المحامي المختص في الحالات القضائية المعقدة."
                </p>
              </div>

              <p className="text-[11px] text-[#9CA3AF] leading-relaxed text-center">
                بتسجيل الدخول، أنت توافق تلقائياً على <a href="#" className="text-[#1B3A6B] font-bold underline hover:text-[#C9A84C]">شروط الاستخدام</a> و <a href="#" className="text-[#1B3A6B] font-bold underline hover:text-[#C9A84C]">سياسة حماية البيانات الشخصية</a>.
              </p>
            </div>

          </div>

          {/* Bottom Trust Section */}
          <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <div className="text-[10px] font-bold text-[#1B3A6B] flex items-center gap-1">
               <ShieldCheck size={14} /> تشفير 256-bit
             </div>
             <div className="text-[10px] font-bold text-[#1B3A6B] flex items-center gap-1">
               <ShieldCheck size={14} /> حماية GDPR
             </div>
             <div className="text-[10px] font-bold text-[#1B3A6B] flex items-center gap-1">
               <ShieldCheck size={14} /> معايير CNDP
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
