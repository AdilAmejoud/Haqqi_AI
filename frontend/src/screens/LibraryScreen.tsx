import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  ArrowRight, 
  Briefcase, 
  Users, 
  Home, 
  Scale, 
  Shield, 
  FileText, 
  Heart, 
  Zap, 
  Send, 
  ChevronDown 
} from 'lucide-react';
import { Profile } from '../types';

interface LibraryScreenProps {
  profile: Profile | null;
}

const CATEGORIES = [
  { id: 'labor', label: 'قانون الشغل', Icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'family', label: 'قانون الأسرة', Icon: Users, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'property', label: 'الملكية العقارية', Icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'commercial', label: 'القانون التجاري', Icon: Scale, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'criminal', label: 'القانون الجنائي', Icon: Shield, color: 'text-slate-600', bg: 'bg-slate-100' },
  { id: 'admin', label: 'المساطر الإدارية', Icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'social', label: 'الحماية الاجتماعية', Icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'digital', label: 'القانون الرقمي', Icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const PROMPTS = [
    { id: '1', category: 'labor', title: 'تحليل عقد الشغل', description: 'مراجعة بنود عقد العمل وتحديد الحقوق والواجبات', prompt: 'راجع ليا عقد الشغل ديالي وقولي واش فيه نقط مشكوك فيها', tags: ['مسودة', 'مراجعة'] },
    { id: '2', category: 'labor', title: 'إجراءات الفصل التعسفي', description: 'خطوات الطعن في قرار الفصل وطلب التعويض', prompt: 'شرح ليا إجراءات الطعن في الفصل التعسفي واش نبدا من النقابة ولا المحكمة؟', tags: ['إجراءات', 'دعوى'] },
    { id: '5', category: 'family', title: 'مسطرة الطلاق', description: 'الإجراءات القانونية لتقديم طلب الطلاق أمام المحكمة', prompt: 'شرح ليا بالتفصيل خطوات مسطرة الطلاق من بداية لنهاية', tags: ['طلاق', 'مسطرة'] },
    { id: '9', category: 'property', title: 'نقل ملكية عقار', description: 'إجراءات البيع والشراء وتسجيل العقار', prompt: 'ما هي خطوات نقل ملكية شقة بشكل رسمي والمصاريف المترتبة على ذلك؟', tags: ['عقار', 'بيع'] },
];

export default function LibraryScreen({ profile }: LibraryScreenProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PROMPTS.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.title.includes(q) || p.description.includes(q) || p.tags.some(t => t.includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleUsePrompt = (prompt: string) => {
    navigate('/chat', { state: { initialPrompt: prompt } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#E8EEF7] rounded-full text-[#6B7280] transition-colors">
          <ArrowRight size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <BookOpen size={20} className="text-[#1B3A6B]" />
            مكتبة الأوامر القانونية
          </h1>
          <p className="text-xs text-[#6B7280]">أوامر جاهزة لمساعدتك في الحصول على أفضل استشارة</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="relative group">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1B3A6B] transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأوامر القانونية... (مثال: طلاق، عقد كراء)" 
            className="w-full pr-12 pl-4 py-3.5 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm transition-all outline-none"
            dir="rtl"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-[#1B3A6B] text-white' : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#E8EEF7]'}`}
          >
            الكل
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-[#1B3A6B] text-white' : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#E8EEF7]'}`}
            >
              <cat.Icon size={14} strokeWidth={1.5} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => {
          const cat = CATEGORIES.find(c => c.id === item.category);
          const isExpanded = expandedPrompt === item.id;
          return (
            <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#1B3A6B]/30 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl ${cat?.bg} flex items-center justify-center`}>
                  {cat && <cat.Icon size={20} className={cat.color} strokeWidth={1.5} />}
                </div>
                <button 
                  onClick={() => setExpandedPrompt(isExpanded ? null : item.id)}
                  className="text-[#6B7280] hover:text-[#1B3A6B] transition-colors"
                >
                  <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <h3 className="font-bold text-[#1F2937] text-sm mb-2">{item.title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed flex-1 mb-4">{item.description}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-5">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold bg-[#E8EEF7] text-[#1B3A6B] px-2 py-0.5 rounded-md">#{tag}</span>
                ))}
              </div>

              {isExpanded && (
                <div className="mb-5 p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[11px] text-[#6B7280] leading-relaxed italic">"{item.prompt}"</p>
                </div>
              )}

              <button 
                onClick={() => handleUsePrompt(item.prompt)}
                className="w-full bg-[#1B3A6B] hover:bg-[#2D4E87] text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send size={14} className="rotate-180" />
                استخدم هذا الأمر
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
