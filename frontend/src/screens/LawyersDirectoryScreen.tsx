import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Search, Scale, CheckCircle,
  Star, MapPin, Phone, Loader, Users
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { Profile, LawyerProfile } from '../types';

interface LawyersDirectoryScreenProps {
  profile: Profile | null;
}

const CITIES = ['الكل', 'الرباط', 'الدار البيضاء', 'مراكش', 'فاس', 'أكادير', 'طنجة', 'مكناس', 'وجدة'];
const SPECIALTIES = [
  'الكل', 'قانون الشغل', 'قانون الأسرة',
  'الملكية العقارية', 'القانون التجاري',
  'المسطرة الجنائية', 'القانون الإداري',
];

export default function LawyersDirectoryScreen({ profile }: LawyersDirectoryScreenProps) {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCity, setActiveCity] = useState('الكل');
  const [activeSpecialty, setActiveSpecialty] = useState('الكل');

  useEffect(() => {
    loadLawyers();
  }, [search, activeCity, activeSpecialty]);

  async function loadLawyers() {
    setLoading(true);
    let query = supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('is_available', true)
      .order('is_verified', { ascending: false })
      .order('rating', { ascending: false });

    if (activeCity !== 'الكل') query = query.eq('city', activeCity);
    if (search.trim()) query = query.ilike('full_name', `%${search}%`);
    if (activeSpecialty !== 'الكل') {
      query = query.contains('specialties', [activeSpecialty]);
    }

    const { data } = await query.limit(30);
    setLawyers(data ?? []);
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/community')}
          className="p-2 hover:bg-[#E8EEF7] rounded-full text-[#6B7280] transition-colors"
        >
          <ArrowRight size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <Scale size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
            دليل المحامين
          </h1>
          <p className="text-xs text-[#6B7280]">
            {lawyers.length} محامٍ متاح
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} strokeWidth={1.5}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث باسم المحامي..."
          className="w-full pr-11 pl-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-right focus:outline-none focus:border-[#1B3A6B] transition-colors"
        />
      </div>

      {/* City filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CITIES.map(city => (
          <button
            key={city}
            onClick={() => setActiveCity(city)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCity === city
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1B3A6B]/30'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Specialty filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SPECIALTIES.map(spec => (
          <button
            key={spec}
            onClick={() => setActiveSpecialty(spec)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              activeSpecialty === spec
                ? 'bg-[#C9A84C] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#C9A84C]/30'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Lawyers grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size={24} className="animate-spin text-[#1B3A6B]" strokeWidth={1.5} />
        </div>
      ) : lawyers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#E8EEF7] rounded-2xl flex items-center justify-center mb-4">
            <Users size={28} className="text-[#1B3A6B]" strokeWidth={1.5} />
          </div>
          <p className="text-[#1F2937] font-semibold mb-1">ما كاين حتى محامي متاح</p>
          <p className="text-sm text-[#6B7280]">جرب تبدل الفلتر</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lawyers.map(lawyer => (
            <div
              key={lawyer.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all"
            >
              {/* Top */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#1B3A6B] rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {lawyer.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {lawyer.is_verified && (
                      <CheckCircle size={14} className="text-[#1B3A6B] flex-shrink-0" strokeWidth={1.5} />
                    )}
                    <h3 className="font-bold text-[#1F2937] text-sm truncate">
                      {lawyer.full_name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                    {lawyer.city && (
                      <div className="flex items-center gap-1">
                        <MapPin size={10} strokeWidth={1.5} />
                        <span>{lawyer.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-[#C9A84C]" strokeWidth={1.5} />
                      <span>{lawyer.rating.toFixed(1)}</span>
                    </div>
                    <span>{lawyer.response_count} إجابة</span>
                  </div>
                </div>
                {lawyer.is_verified && (
                  <span className="text-[9px] bg-[#E8EEF7] text-[#1B3A6B] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                    معتمد ✓
                  </span>
                )}
              </div>

              {/* Bio */}
              {lawyer.bio && (
                <p className="text-xs text-[#6B7280] leading-relaxed mb-3 line-clamp-2">
                  {lawyer.bio}
                </p>
              )}

              {/* Specialties */}
              {lawyer.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4 justify-end">
                  {lawyer.specialties.slice(0, 3).map(spec => (
                    <span key={spec}
                      className="text-[9px] bg-[#F7F8FA] border border-[#E5E7EB] text-[#6B7280] px-2 py-0.5 rounded-lg">
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {/* Contact */}
              {lawyer.phone && (
                <a
                  href={`tel:${lawyer.phone}`}
                  className="flex items-center justify-center gap-2 w-full border border-[#1B3A6B] text-[#1B3A6B] text-xs font-bold py-2.5 rounded-xl hover:bg-[#E8EEF7] transition-colors"
                >
                  <Phone size={13} strokeWidth={1.5} />
                  تواصل مع المحامي
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
