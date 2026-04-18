import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingScreen.module.css';

/* ── Brand ── */
const C = {
  navy:      '#1B3A6B',
  gold:      '#C9A84C',
  goldLight: '#E8C96D',
  dark:      '#0F2040',
  lightBg:   '#F5F7FA',
  muted:     '#6B7A99',
  border:    '#DDE3EF',
  white:     '#FFFFFF',
};

/* ── Icon helper (Material Symbols already in index.css) ── */
const Icon = ({ name, size = 22, color = 'inherit', className = '' }: { name: string; size?: number; color?: string; className?: string }) => (
  <span className={`material-symbols-outlined select-none ${className}`} style={{ fontSize: size, color, lineHeight: 1, display: 'inline-block' }}>
    {name}
  </span>
);

/* ── Data ── */
const NAV = [
  { href: '#hero',          label: 'الرئيسية' },
  { href: '#services',      label: 'الخدمات' },
  { href: '#how-it-works',  label: 'كيف تعمل' },
  { href: '#pricing',       label: 'التسعير' },
  { href: '#faq',           label: 'الأسئلة الشائعة' },
];

const SERVICES = [
  { icon: 'gavel',            title: 'الاستشارات القانونية',  desc: 'اسأل عن حقوقك في أي موضوع قانوني بالدارجة المغربية' },
  { icon: 'article',          title: 'فهم العقود والوثائق',   desc: 'شرح بسيط للعقود والاتفاقيات دون لغة قانونية معقدة' },
  { icon: 'family_restroom',  title: 'قانون الأسرة والإرث',   desc: 'الطلاق، النفقة، الميراث، الحضانة ومسائل الأحوال الشخصية' },
  { icon: 'directions_car',   title: 'مخالفات السير',         desc: 'فهم المخالفات والغرامات وكيفية الطعن فيها' },
  { icon: 'work',             title: 'قانون العمل',           desc: 'حقوق الموظف، الفصل التعسفي، التعويضات والإجراءات' },
  { icon: 'privacy_tip',      title: 'الخصوصية والبيانات',    desc: 'حماية بياناتك الشخصية وفق قانون 09.08 المغربي' },
];

const STEPS = [
  { icon: 'chat_bubble',           num: '١', title: 'اكتب سؤالك بالدارجة',   desc: 'مكتبش بالفصحى، استعمل لغتك العادية كما تتكلم مع صاحبك' },
  { icon: 'psychology',            num: '٢', title: 'الذكاء الاصطناعي يحلل', desc: 'يفهم سؤالك ويبحث في القانون المغربي والاجتهادات القضائية' },
  { icon: 'assignment_turned_in',  num: '٣', title: 'جواب واضح وعملي',       desc: 'شرح مبسط مع الخطوات اللي تدير خطوة بخطوة' },
];

const PRICING = [
  {
    id: 'free', name: 'مجاني', price: '0', unit: 'د.م', period: '',
    sub: 'للأفراد والاحتياجات البسيطة',
    features: ['3 استشارات شهرياً', 'مكتبة القوانين العامة', 'نموذج عقد واحد'],
    cta: 'ابدأ الآن', featured: false,
  },
  {
    id: 'pro', name: 'المهني', price: '199', unit: 'د.م', period: '/شهر',
    sub: 'للمقاولين والمهنيين',
    features: ['استشارات غير محدودة', 'جميع نماذج العقود PDF', 'مكتبة 200+ أمر قانوني', 'دعم عبر الواتساب'],
    cta: 'جرّبه مجاناً', featured: true,
  },
  {
    id: 'enterprise', name: 'Pro', price: 'مخصص', unit: '', period: '',
    sub: 'للشركات ومكاتب المحاماة',
    features: ['كل ما في الباقة المهنية', 'مستخدمون غير محدودون', 'خوادم سيادية خاصة', 'SLA 24/7'],
    cta: 'تحدث مع فريقنا', featured: false,
  },
];

const FAQS = [
  { q: 'هل يعوض حقي AI المحامي؟',              a: 'حقي AI هو أداة استشارية وتثقيفية. في القضايا المعقدة ننصح دائماً بالاستعانة بمحامٍ مختص، ويمكن لمنصتنا توجيهك للمهني المناسب.' },
  { q: 'هل المعلومات محدثة حسب آخر القوانين؟',  a: 'نعم، قاعدة بياناتنا تُحدَّث بانتظام بناءً على الجريدة الرسمية المغربية والاجتهادات القضائية الحديثة.' },
  { q: 'كيف يتم ضمان خصوصية ملفاتي؟',          a: 'نستخدم تشفير AES-256 لجميع البيانات. محادثاتك لا تُشارك مع أي طرف ثالث ويمكنك حذف كل سجلاتك بضغطة واحدة.' },
  { q: 'ما القوانين التي يغطيها حقي AI؟',       a: 'مدونة الشغل، قانون الأسرة، القانون التجاري، قانون الالتزامات والعقود، القانون الجنائي، التشريعات العقارية، وقوانين الحماية الاجتماعية.' },
  { q: 'هل يمكنني توليد وثائق قانونية؟',       a: 'نعم، تتيح لك المنصة توليد نماذج عقود (عمل، إيجار، بيع، شراكة) مطابقة للتشريعات المغربية جاهزة للتحرير والطباعة.' },
  { q: 'هل هناك نسخة مجانية؟',                 a: 'نعم، الخطة الأساسية مجانية تتيح استشارات محدودة. يمكنك الترقية في أي وقت للحصول على وصول غير محدود.' },
];

/* ════════════════════════════════
   COMPONENT
════════════════════════════════ */
export default function LandingScreen() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSolid, setNavSolid]     = useState(false);
  const [openFaq, setOpenFaq]       = useState<number | null>(null);
  const [stats, setStats]           = useState({ s1: 0, s2: 0, s3: 0, s4: 0 });
  const [videoPlaying, setVideoPlaying] = useState(false);
  const statsRef    = useRef<HTMLElement>(null);
  const animated    = useRef(false);
  const topRef      = useRef<HTMLButtonElement>(null);
  const progRef     = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);

  /* scroll handler — target internal scrollable div, not window */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.scrollBehavior = 'smooth';
    const fn = () => {
      setNavSolid(el.scrollTop > 40);
      if (progRef.current) {
        const p = el.scrollTop / (el.scrollHeight - el.clientHeight);
        progRef.current.style.width = `${p * 100}%`;
      }
      if (topRef.current) {
        const show = el.scrollTop > 300;
        topRef.current.style.opacity       = show ? '1' : '0';
        topRef.current.style.transform     = show ? 'translateY(0)' : 'translateY(12px)';
        topRef.current.style.pointerEvents = show ? 'auto' : 'none';
      }
    };
    el.addEventListener('scroll', fn);
    return () => el.removeEventListener('scroll', fn);
  }, []);

  /* counter animation — uses IntersectionObserver which works on any element */
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || animated.current) return;
      animated.current = true;
      const dur = 1600, t0 = performance.now();
      const ease = (t: number) => 1 - (1 - t) ** 3;
      const tick = (now: number) => {
        const p = ease(Math.min((now - t0) / dur, 1));
        setStats({ s1: Math.floor(p * 385), s2: Math.floor(p * 3000), s3: Math.floor(p * 96), s4: Math.floor(p * 18) });
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.2, rootMargin: '0px' });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  /* smooth scroll to anchor */
  const scrollTo = (id: string) => {
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={scrollRef} className="landingContainer" dir="rtl">

      {/* progress */}
      <div ref={progRef} className="progressBar" />

      {/* ══════════════════════  NAVBAR  ══════════════════════ */}
      <nav className={`navbar ${navSolid ? 'navbarSolid' : ''}`} >
        <div className={styles.navContent}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <Icon name="balance" size={20} color={C.gold} />
            </div>
            <span className={styles.logoText}>
              حقي <span className={styles.logoGold}>AI</span>
            </span>
          </div>

          {/* Center links */}
          <div className={`${styles.navLinks} hidden lg:flex`}>
            {NAV.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} className={styles.navLinkBtn}
                onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
                onMouseLeave={e => (e.currentTarget.style.color = C.navy)}>
                {l.label}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="hidden lg:flex">
            <button onClick={() => navigate('/auth')} style={{ padding: '7px 18px', borderRadius: 8, border: `1.5px solid ${C.navy}`, background: 'transparent', color: C.navy, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.navy; }}>
              تسجيل الدخول
            </button>
            <button onClick={() => navigate('/onboarding')} style={{ padding: '7px 18px', borderRadius: 8, background: C.gold, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'background 0.15s', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = C.goldLight}
              onMouseLeave={e => e.currentTarget.style.background = C.gold}>
              ابدأ مجاناً
            </button>
          </div>

          {/* Hamburger */}
          <button className="lg:hidden" aria-label="قائمة التنقل" onClick={() => setMobileOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.navy }}>
            <Icon name={mobileOpen ? 'close' : 'menu'} size={26} color={C.navy} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div style={{ overflow: 'hidden', maxHeight: mobileOpen ? 360 : 0, transition: 'max-height 0.3s ease', borderTop: mobileOpen ? `1px solid ${C.border}` : 'none', background: C.white }} className="lg:hidden">
          <div style={{ padding: '8px 24px 20px' }}>
            {NAV.map(l => (
                <button key={l.href} onClick={() => { setMobileOpen(false); scrollTo(l.href); }}
                style={{ display: 'block', width: '100%', textAlign: 'right', padding: '11px 0', borderBottom: `1px solid ${C.border}`, color: C.navy, fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {l.label}
                </button>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => { setMobileOpen(false); navigate('/auth'); }} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${C.navy}`, background: 'transparent', color: C.navy, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>تسجيل الدخول</button>
              <button onClick={() => { setMobileOpen(false); navigate('/onboarding'); }} style={{ flex: 1, padding: '10px', borderRadius: 8, background: C.gold, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>ابدأ مجاناً</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════  HERO  ══════════════════════ */}
      <section id="hero" style={{ background: C.navy, paddingTop: 64, position: 'relative', overflow: 'hidden' }}>
        {/* geometric bg */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-rule='evenodd'%3E%3Ccircle cx='4' cy='4' r='1'/%3E%3Ccircle cx='26' cy='4' r='1'/%3E%3Ccircle cx='48' cy='4' r='1'/%3E%3Ccircle cx='4' cy='26' r='1'/%3E%3Ccircle cx='26' cy='26' r='1'/%3E%3Ccircle cx='48' cy='26' r='1'/%3E%3Ccircle cx='4' cy='48' r='1'/%3E%3Ccircle cx='26' cy='48' r='1'/%3E%3Ccircle cx='48' cy='48' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}
          className="hero-grid">
          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: `rgba(201,168,76,0.14)`, border: `1px solid ${C.gold}50`, color: C.gold, fontSize: 13, fontWeight: 700, width: 'fit-content' }}>
              <Icon name="smart_toy" size={16} color={C.gold} />
              الذكاء الاصطناعي في خدمة حقوقك
            </div>

            <h1 style={{ fontFamily: "'Noto Naskh Arabic', 'Noto Sans Arabic', serif", fontSize: 'clamp(1.8rem,4vw,2.75rem)', fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: 0 }}>
              احمِ حقوقك بذكاء<br />
              <span style={{ color: C.gold }}>بلهجتك المغربية</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 16, lineHeight: 1.75, margin: 0, maxWidth: 460 }}>
              مساعدك القانوني الذكي يفهم دارجتك، يشرح حقوقك، ويوجهك خطوة بخطوة نحو الحل الصحيح.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
              <button onClick={() => navigate('/onboarding')} style={{ padding: '11px 28px', borderRadius: 9, background: C.gold, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'background 0.15s', boxShadow: `0 4px 18px ${C.gold}50` }}
                onMouseEnter={e => e.currentTarget.style.background = C.goldLight}
                onMouseLeave={e => e.currentTarget.style.background = C.gold}>
                ابدأ مجاناً
              </button>
              <button onClick={() => scrollTo('#video')} style={{ padding: '11px 22px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', fontWeight: 600, fontSize: 14, background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, transition: 'border-color 0.15s, background 0.15s', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <Icon name="play_circle" size={18} color="#fff" />
                شاهد كيف يعمل
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 8 }}>
              {[
                { icon: 'lock', text: 'بياناتك محمية' },
                { icon: 'group', text: '385+ مستخدم نشط' },
                { icon: 'verified', text: '96% دقة في الإجابات' },
              ].map(t => (
                <span key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                  <Icon name={t.icon} size={15} color="rgba(255,255,255,0.5)" />
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          {/* Chat mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 360, borderRadius: 18, background: C.dark, border: `1px solid rgba(201,168,76,0.25)`, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden', animation: 'floatY 3s ease-in-out infinite' }}>
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="balance" size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>حقي AI</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4ade80' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                    متصل الآن
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: C.gold, color: '#fff', borderRadius: '14px 14px 4px 14px', padding: '9px 13px', fontSize: 13, maxWidth: '85%', textAlign: 'right', lineHeight: 1.55 }}>
                    صاحبي فصلني من الخدمة بلا إشعار، واش عندي حق؟
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.88)', borderRadius: '14px 14px 14px 4px', padding: '9px 13px', fontSize: 13, maxWidth: '88%', textAlign: 'right', lineHeight: 1.6 }}>
                    نعم، وفق مدونة الشغل المادة 43، الفصل بدون إشعار مسبق يُعتبر تعسفياً ويحق لك التعويض...
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: C.gold, color: '#fff', borderRadius: '14px 14px 4px 14px', padding: '9px 13px', fontSize: 13, maxWidth: '70%', textAlign: 'right', lineHeight: 1.55 }}>
                    شحال ديال التعويض؟
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', borderRadius: '14px 14px 14px 4px', padding: '9px 13px', fontSize: 13, maxWidth: '88%', textAlign: 'right', lineHeight: 1.6 }}>
                    يُحسب على أساس الأجر الشهري × سنوات الخدمة. أخبرني كم سنة خدمت وأنا نجيب لك الحساب دقيق 👇
                  </div>
                </div>
              </div>

              {/* Input */}
              <div style={{ padding: '10px 14px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: '9px 12px' }}>
                  <span style={{ flex: 1, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>اكتب سؤالك بالدارجة...</span>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="send" size={16} color="#fff" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* responsive hero grid */}
        <style>{`
          .hero-grid { grid-template-columns: 1fr 1fr; }
          @media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr; } }
          @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
      </section>

      {/* ══════════════════════  STATS BAR  ══════════════════════ */}
      <section ref={statsRef} style={{ background: C.gold }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}
          className="stats-grid">
          {[
            { val: `${stats.s1}+`,  label: 'مستخدم نشط',            icon: 'group' },
            { val: `${stats.s2 > 999 ? (stats.s2/1000).toFixed(0)+'k+' : stats.s2+'+'}`, label: 'سؤال قانوني', icon: 'forum' },
            { val: `${stats.s3}%`,  label: 'دقة في الإجابات',        icon: 'verified' },
            { val: `${stats.s4}%`,  label: 'نمو شهري',               icon: 'trending_up' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 8px', textAlign: 'center' }}>
              <Icon name={s.icon} size={24} color="rgba(255,255,255,0.75)" />
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr);}}`}</style>
      </section>

      {/* ══════════════════════  SERVICES GRID  ══════════════════════ */}
      <section id="services" style={{ background: C.white, padding: '56px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>خدماتنا</span>
            <h2 style={{ fontFamily: "'Noto Naskh Arabic','Noto Sans Arabic',serif", fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 700, color: C.navy, margin: '8px 0 10px' }}>
              الخدمات القانونية المتاحة
            </h2>
            <p style={{ color: C.muted, fontSize: 14, maxWidth: 460, margin: '0 auto' }}>
              كل ما تحتاجه لمعرفة حقوقك في مكان واحد — بسيط، سريع، وبلغتك
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="svc-grid">
            {SERVICES.map(svc => <ServiceCard key={svc.title} icon={svc.icon} title={svc.title} desc={svc.desc} onCta={() => navigate('/onboarding')} />)}
          </div>

          <style>{`
            .svc-grid{grid-template-columns:repeat(3,1fr);}
            @media(max-width:900px){.svc-grid{grid-template-columns:repeat(2,1fr);}}
            @media(max-width:560px){.svc-grid{grid-template-columns:1fr;}}
          `}</style>
        </div>
      </section>

      {/* ══════════════════════  VIDEO  ══════════════════════ */}
      <section id="video" style={{ background: C.lightBg, padding: '56px 0' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>فيديو تعريفي</span>
            <h2 style={{ fontFamily: "'Noto Naskh Arabic','Noto Sans Arabic',serif", fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 700, color: C.navy, margin: '8px 0 8px' }}>
              شوف كيفاش كاتخدم HaqqiAI
            </h2>
            <p style={{ color: C.muted, fontSize: 14 }}>فيديو توضيحي بالدارجة المغربية — دقيقتين بس</p>
          </div>

          {/* 16:9 box */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: 16, overflow: 'hidden', background: C.navy, border: `1px solid rgba(201,168,76,0.2)`, boxShadow: '0 16px 48px rgba(27,58,107,0.16)' }}>
            <video 
              ref={videoRef}
              src="/haqqiai.mp4" 
              controls={videoPlaying} 
              playsInline 
              className="video-iframe"
              style={{ objectFit: 'cover' }}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            />
            
            {!videoPlaying && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'rgba(27,58,107,0.35)' }}>
<button 
                  aria-label="تشغيل الفيديو التعريفي"
                  onClick={() => {
                    setVideoPlaying(true);
                    if (videoRef.current) videoRef.current.play();
                  }} 
                  style={{ width: 68, height: 68, borderRadius: '50%', background: C.gold, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 28px ${C.gold}60`, transition: 'transform 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Icon name="play_arrow" size={34} color="#fff" />
                </button>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>اضغط لمشاهدة الفيديو التعريفي</p>
              </div>
            )}
          </div>

          {/* chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 20 }}>
            {[
              { icon: 'schedule',  text: 'مدة: دقيقتين' },
              { icon: 'language',  text: 'الدارجة المغربية' },
              { icon: 'phone_iphone', text: 'متاح على الجوال' },
            ].map(c => (
              <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 999, background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', fontSize: 13, color: C.navy, fontWeight: 600 }}>
                <Icon name={c.icon} size={16} color={C.gold} />
                {c.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════  HOW IT WORKS  ══════════════════════ */}
      <section id="how-it-works" style={{ background: C.white, padding: '56px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>الطريقة</span>
            <h2 style={{ fontFamily: "'Noto Naskh Arabic','Noto Sans Arabic',serif", fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 700, color: C.navy, margin: '8px 0 0' }}>
              كيف تبدأ؟
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, position: 'relative', alignItems: 'start' }} className="steps-grid">
            {/* connector */}
            <div style={{ position: 'absolute', top: 28, right: '16%', left: '16%', height: 2, background: `linear-gradient(to left, ${C.gold}20, ${C.gold}80, ${C.gold}20)`, pointerEvents: 'none' }} className="steps-line" />

            {STEPS.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1, gap: 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: i === 1 ? C.gold : C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 6px 20px ${i === 1 ? C.gold : C.navy}40` }}>
                  <Icon name={step.icon} size={26} color="#fff" />
                </div>
                <div style={{ background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 6 }}>الخطوة {step.num}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}

            <style>{`
              .steps-grid{grid-template-columns:repeat(3,1fr);}
              @media(max-width:640px){.steps-grid{grid-template-columns:1fr;} .steps-line{display:none;}}
            `}</style>
          </div>
        </div>
      </section>

      {/* ══════════════════════  PRICING  ══════════════════════ */}
      <section id="pricing" style={{ background: C.navy, padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>الباقات</span>
            <h2 style={{ fontFamily: "'Noto Naskh Arabic','Noto Sans Arabic',serif", fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 700, color: '#fff', margin: '8px 0 8px' }}>
              اختار الباقة ديالك
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>من الأفراد إلى الشركات — تسعير بسيط وشفاف</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, alignItems: 'stretch' }} className="price-grid">
            {PRICING.map(p => <PricingCard key={p.id} plan={p} onSelect={() => navigate('/onboarding')} />)}
          </div>
          <style>{`
            .price-grid{grid-template-columns:repeat(3,1fr);}
            @media(max-width:700px){.price-grid{grid-template-columns:1fr;}}
          `}</style>
        </div>
      </section>

      {/* ══════════════════════  FAQ  ══════════════════════ */}
      <section id="faq" style={{ background: C.white, padding: '56px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>دعم</span>
            <h2 style={{ fontFamily: "'Noto Naskh Arabic','Noto Sans Arabic',serif", fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 700, color: C.navy, margin: '8px 0 0' }}>
              الأسئلة الشائعة
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} open={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════  FINAL CTA  ══════════════════════ */}
      <section id="contact" style={{ background: C.dark, padding: '64px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}1a 0%, transparent 70%)` }} />
        </div>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Noto Naskh Arabic','Noto Sans Arabic',serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 16 }}>
            تأكد من وضعيتك القانونية<br />
            <span style={{ color: C.gold }}>في أقل من دقيقة</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, marginBottom: 32 }}>
            انضم إلى مجتمع المغاربة الذين اختاروا التكنولوجيا لحماية حقوقهم.
          </p>
          <button onClick={() => navigate('/onboarding')} style={{ padding: '13px 36px', borderRadius: 10, background: C.gold, color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'background 0.15s', boxShadow: `0 6px 24px ${C.gold}50` }}
            onMouseEnter={e => e.currentTarget.style.background = C.goldLight}
            onMouseLeave={e => e.currentTarget.style.background = C.gold}>
            ابدأ مجاناً الآن
          </button>
        </div>
      </section>

      {/* ══════════════════════  FOOTER  ══════════════════════ */}
      <footer style={{ background: '#0A1A35' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 36, marginBottom: 40 }} className="footer-grid">
            {/* Logo col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="balance" size={18} color="#fff" />
                </div>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>حقي <span style={{ color: C.gold }}>AI</span></span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, margin: 0 }}>
                منصة مغربية رائدة تهدف إلى دمقرطة الولوج للمعلومة القانونية.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { icon: 'work', label: 'LinkedIn' },
                  { icon: 'smart_display', label: 'YouTube' },
                  { icon: 'photo_camera', label: 'Instagram' },
                ].map(s => (
                  <a key={s.label} href="#" aria-label={s.label} style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.gold; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}>
                    <Icon name={s.icon} size={16} color="rgba(255,255,255,0.55)" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <FooterCol title="روابط سريعة" links={[['#hero','الرئيسية'],['#services','الخدمات'],['#how-it-works','كيف تعمل'],['#pricing','التسعير'],['#faq','الأسئلة الشائعة']]} />

            {/* Services */}
            <FooterCol title="الخدمات" links={[['#services','الاستشارات القانونية'],['#services','فهم العقود'],['#services','قانون الأسرة'],['#services','قانون العمل'],['#services','مخالفات السير']]} />

            {/* Contact */}
            <div>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 3, height: 16, background: C.gold, borderRadius: 4, display: 'inline-block' }} />
                تواصل معنا
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { icon: 'mail', text: 'contact@haqqiai.ma' },
                  { icon: 'location_on', text: 'الدار البيضاء، المغرب' },
                  { icon: 'phone', text: '+212 6 00 00 00 00' },
                ].map(c => (
                  <span key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.48)' }}>
                    <Icon name={c.icon} size={15} color={C.gold} />
                    {c.text}
                  </span>
                ))}
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: `${C.gold}18`, border: `1px solid ${C.gold}30`, fontSize: 11, fontWeight: 700, color: C.gold }}>
                  <Icon name="flag" size={13} color={C.gold} />
                  MADE IN MOROCCO
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: 0 }}>
              © 2024 حقي AI. جميع الحقوق محفوظة لشركة HAQQI AI SOLUTIONS SARL.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['سياسة الخصوصية', 'شروط الاستخدام'].map(l => (
                <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          .footer-grid{grid-template-columns:repeat(4,1fr);}
          @media(max-width:900px){.footer-grid{grid-template-columns:repeat(2,1fr);}}
          @media(max-width:480px){.footer-grid{grid-template-columns:1fr;}}
        `}</style>
      </footer>

      {/* Back to top */}
          <button ref={topRef} onClick={() => { if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }}
        aria-label="العودة للأعلى"
        title="العودة للأعلى"
        style={{ position: 'sticky', bottom: 20, marginLeft: 20, width: 40, height: 40, borderRadius: '50%', background: C.navy, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(27,58,107,0.35)', zIndex: 150, opacity: 0, transform: 'translateY(12px)', pointerEvents: 'none', transition: 'all 0.3s ease', alignSelf: 'flex-end' }}>
        <Icon name="keyboard_arrow_up" size={22} color={C.gold} />
      </button>
    </div>
  );
}

/* ── Sub-components ── */

interface ServiceCardProps {
  key?: any;
  icon: string;
  title: string;
  desc: string;
  onCta: () => void;
}

function ServiceCard({ icon, title, desc, onCta }: ServiceCardProps) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`serviceCard ${hov ? 'serviceCardHover' : ''}`}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: hov ? C.navy : C.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
        <Icon name={icon} size={22} color={hov ? C.gold : C.navy} />
      </div>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>{title}</h3>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
      <button onClick={onCta} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: hov ? C.gold : C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginTop: 'auto', transition: 'color 0.2s' }}>
        اكتشف الخدمة
        <Icon name="arrow_back_ios" size={13} color={hov ? C.gold : C.muted} />
      </button>
    </div>
  );
}

interface PricingCardProps {
  key?: any;
  plan: any;
  onSelect: () => void;
}

function PricingCard({ plan, onSelect }: PricingCardProps) {
  return (
    <div style={{ borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', border: plan.featured ? `2px solid ${C.gold}` : '1px solid rgba(255,255,255,0.1)', background: plan.featured ? C.white : 'rgba(255,255,255,0.05)', transform: plan.featured ? 'translateY(-6px)' : 'none', boxShadow: plan.featured ? `0 20px 56px rgba(0,0,0,0.25)` : 'none', transition: 'transform 0.2s' }}>
      {plan.featured && (
        <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: C.gold, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
          الأكثر اختياراً ✦
        </div>
      )}
      <h3 style={{ fontSize: 17, fontWeight: 700, color: plan.featured ? C.navy : '#fff', marginBottom: 4 }}>{plan.name}</h3>
      <p style={{ fontSize: 12, color: plan.featured ? C.muted : 'rgba(255,255,255,0.5)', marginBottom: 18 }}>{plan.sub}</p>
      <div style={{ marginBottom: 22 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: plan.featured ? C.navy : '#fff' }}>
          {plan.id === 'enterprise' ? plan.price : `${plan.price} ${plan.unit}`}
        </span>
        {plan.period && <span style={{ fontSize: 13, color: plan.featured ? C.muted : 'rgba(255,255,255,0.45)' }}>{plan.period}</span>}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {plan.features.map((f: string) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: plan.featured ? C.muted : 'rgba(255,255,255,0.65)' }}>
            <Icon name="check_circle" size={17} color={C.gold} />
            {f}
          </li>
        ))}
      </ul>
      <button onClick={onSelect} style={{ width: '100%', padding: '11px', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s', ...(plan.featured ? { background: C.gold, color: '#fff', border: 'none' } : { background: 'transparent', border: '1.5px solid rgba(255,255,255,0.22)', color: '#fff' }) }}>
        {plan.cta}
      </button>
    </div>
  );
}

interface FaqItemProps {
  key?: any;
  question: string;
  answer: string;
  open: boolean;
  toggle: () => void;
}

function FaqItem({ question, answer, open, toggle }: FaqItemProps) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${open ? C.gold + '55' : C.border}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '15px 18px', background: C.white, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{question}</span>
        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: open ? C.gold : C.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, transform 0.25s', transform: open ? 'rotate(45deg)' : 'none' }}>
          <Icon name="add" size={16} color={open ? '#fff' : C.navy} />
        </span>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, opacity: open ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.25s ease' }}>
        <div style={{ padding: '0 18px 16px', fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{answer}</div>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h5 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 3, height: 16, background: C.gold, borderRadius: 4, display: 'inline-block' }} />
        {title}
      </h5>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(([href, label]) => (
          <li key={label}>
            <a href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
