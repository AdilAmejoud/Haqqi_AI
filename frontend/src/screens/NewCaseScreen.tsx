import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  User, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';

const categories = [
  'قانون الشغل',
  'قانون الأسرة',
  'القانون العقاري',
  'القانون التجاري',
  'القانون الجنائي',
  'القانون الإداري',
  'قانون الكراء',
  'أخرى',
];

export default function NewCaseScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState({
    title: '',
    clientName: '',
    category: '',
    nextHearing: '',
    description: '',
    reference: '',
  });

  const handleCreate = async () => {
    if (!caseData.title.trim() || !caseData.clientName.trim()) {
      setError('يرجى ملء الحقول الإجبارية (العنوان واسم الموكل)');
      return;
    }
    
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('cases')
      .insert({
        lawyer_id: user.id,
        title: caseData.title,
        client_name: caseData.clientName,
        category: caseData.category || null,
        status: 'new',
        next_hearing: caseData.nextHearing || null,
        reference_number: caseData.reference || null,
        notes: caseData.description || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase Error:', insertError);
      setError(`خطأ: ${insertError.message}. تأكد من تفعيل صلاحيات (RLS policies) للجدول.`);
      setLoading(false);
      return;
    }

    if (data) {
      navigate(`/cases/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#E8EEF7] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-[#1B3A6B]" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">إنشاء قضية جديدة</h1>
          <p className="text-[#6B7280] text-sm">
            أضف تفاصيل القضية وملفاتها لتنظيم عملك بشكل احترافي
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[2rem] p-8 shadow-sm">

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-4 mb-6">
            <p className="text-xs font-semibold text-[#1F2937] mb-1">كيفاش تستعمل القضايا؟</p>
            <p className="text-xs text-[#6B7280] leading-relaxed font-medium">
              القضايا كتساعدك تنظم ملفاتك وتربط الوثائق بالمحادثات. زيد التعليمات والملفات باش AI يفهم سياق قضيتك مزيان.
            </p>
          </div>

          <div className="mb-5">
            <label htmlFor="case_title" className="block text-sm font-bold text-[#1F2937] mb-2">عنوان القضية *</label>
            <input
              id="case_title"
              type="text"
              value={caseData.title}
              onChange={e => setCaseData(p => ({ ...p, title: e.target.value }))}
              placeholder="مثال: فصل تعسفي — محمد الأمين ضد شركة X"
              title="عنوان القضية"
              aria-label="عنوان القضية"
              className="w-full px-4 py-3.5 border border-[#E5E7EB] rounded-2xl text-right text-sm text-[#1F2937] focus:outline-none focus:border-[#1B3A6B] bg-[#F7F8FA] transition-all"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="client_name" className="block text-sm font-bold text-[#1F2937] mb-2">اسم الموكل *</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" strokeWidth={1.5} />
              <input
                id="client_name"
                type="text"
                value={caseData.clientName}
                onChange={e => setCaseData(p => ({ ...p, clientName: e.target.value }))}
                placeholder="الاسم الكامل للموكل"
                title="اسم الموكل"
                aria-label="اسم الموكل"
                className="w-full px-4 py-3.5 pl-12 border border-[#E5E7EB] rounded-2xl text-right text-sm text-[#1F2937] focus:outline-none focus:border-[#1B3A6B] bg-[#F7F8FA] transition-all"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-bold text-[#1F2937] mb-2">نوع القضية</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCaseData(p => ({ ...p, category: cat }))}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-right transition-all ${
                    caseData.category === cat
                      ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#1B3A6B]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="hearing_date" className="block text-sm font-bold text-[#1F2937] mb-2">تاريخ الجلسة القادمة</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" strokeWidth={1.5} />
              <input
                id="hearing_date"
                type="date"
                value={caseData.nextHearing}
                onChange={e => setCaseData(p => ({ ...p, nextHearing: e.target.value }))}
                title="تاريخ الجلسة"
                aria-label="تاريخ الجلسة"
                className="w-full px-4 py-3.5 pl-12 border border-[#E5E7EB] rounded-2xl text-right text-sm text-[#1F2937] focus:outline-none focus:border-[#1B3A6B] bg-[#F7F8FA] transition-all"
              />
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="case_desc" className="block text-sm font-bold text-[#1F2937] mb-2">وصف القضية وملاحظات</label>
            <textarea
              id="case_desc"
              value={caseData.description}
              onChange={e => setCaseData(p => ({ ...p, description: e.target.value }))}
              placeholder="اكتب ملخصاً للقضية..."
              title="وصف القضية"
              aria-label="وصف القضية"
              rows={3}
              className="w-full px-4 py-3.5 border border-[#E5E7EB] rounded-2xl text-right text-sm text-[#1F2937] focus:outline-none focus:border-[#1B3A6B] bg-[#F7F8FA] resize-none transition-all"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !caseData.title.trim() || !caseData.clientName.trim()}
            className="w-full py-4 bg-[#1B3A6B] text-white rounded-2xl text-sm font-bold disabled:opacity-40 hover:bg-[#2D4E87] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1B3A6B]/10 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'إنشاء القضية ←'
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
