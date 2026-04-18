import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, User, BookOpen, Briefcase, Check } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { extractNameFromEmail } from '../utils/extractNameFromEmail';
import { upsertProfile } from '../utils/supabase/profile';
import { Profile } from '../types';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Profile["legal_level"]>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setName(extractNameFromEmail(user.email || ''));
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!user || !selectedLevel || !name.trim()) return;
    setLoading(true);
    try {
      const { error } = await upsertProfile(user.id, {
        full_name: name.trim(),
        legal_level: selectedLevel,
        onboarding_completed: true,
      });

      if (error) {
        console.error('Error saving profile:', error);
        alert('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.');
        setLoading(false);
        return;
      }

      // Update global profile state through the callback if provided
      if (onComplete) {
        await onComplete();
      }
      navigate('/dashboard');
    } catch (e) {
      console.error('Unexpected error saving profile:', e);
      alert('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6" dir="rtl">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 w-full max-w-md text-right shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Scale size={24} className="text-[#1B3A6B]" strokeWidth={1.5} />
          <span className="font-bold text-[#1B3A6B] text-xl">حقي</span>
          <span className="text-[#C9A84C] font-bold text-xl">AI</span>
        </div>

        {/* Welcome */}
        <h1 className="text-2xl font-bold text-[#1F2937] mb-1">مرحباً بك! 👋</h1>
        <p className="text-[#6B7280] text-sm mb-8">قبل ما نبدا، كيفاش تحب نناديك؟</p>

        {/* Name field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#1F2937] mb-2">اسمك الكامل</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-right text-[#1F2937] focus:outline-none focus:border-[#1B3A6B] bg-[#F7F8FA] text-sm transition-all"
            placeholder="اكتب اسمك هنا..."
          />
          <p className="text-xs text-[#6B7280] mt-1.5">هاد الاسم غادي يبان فالمحادثات ديالك</p>
        </div>

        {/* Level selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#1F2937] mb-3">شكون أنت؟</label>
          <div className="space-y-3">
            {[
              { value: 'citizen', icon: User,      label: 'مواطن عادي',   sub: 'باغي نفهم حقوقي' },
              { value: 'student', icon: BookOpen,  label: 'طالب قانون',   sub: 'للبحث والدراسة' },
              { value: 'expert', icon: Briefcase, label: 'محامي / خبير', sub: 'إدارة قضايا ووثائق' },
            ].map(({ value, icon: Icon, label, sub }) => (
              <button
                key={value}
                onClick={() => setSelectedLevel(value as Profile["legal_level"])}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-right transition-all ${
                  selectedLevel === value
                    ? 'border-[#1B3A6B] bg-[#E8EEF7]'
                    : 'border-[#E5E7EB] hover:border-[#1B3A6B]/40 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  selectedLevel === value ? 'bg-[#1B3A6B]' : 'bg-[#F7F8FA]'
                }`}>
                  <Icon size={18} className={selectedLevel === value ? 'text-white' : 'text-[#6B7280]'} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1F2937] text-sm">{label}</p>
                  <p className="text-xs text-[#6B7280]">{sub}</p>
                </div>
                {selectedLevel === value && <Check size={18} className="text-[#1B3A6B]" />}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!selectedLevel || !name.trim() || loading}
          className="w-full bg-[#1B3A6B] text-white font-bold py-3.5 rounded-xl disabled:opacity-40 hover:bg-[#2D4E87] transition-all flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <span>ابدأ استخدام حقي AI</span>
              <span className="text-xl">←</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
