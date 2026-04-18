import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, Search, Plus, Calendar,
  User, ChevronLeft, Clock, CheckCircle,
  Circle, Archive, MoreHorizontal, Star,
  Pencil, Trash2
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { Profile, Case } from '../types';
import { supabase } from '../utils/supabase/client';

interface CasesListScreenProps {
  profile: Profile | null;
}

// Mock data — will be handled by state inside component
// status configuration
const statusConfig = {
  new:       { label: 'جديدة',   bg: 'bg-[#E8EEF7]', text: 'text-[#1B3A6B]', dotClass: 'dot-new' },
  active:    { label: 'جارية',   bg: 'bg-[#F5EDCC]', text: 'text-[#8B6914]', dotClass: 'dot-active' },
  completed: { label: 'مكتملة', bg: 'bg-[#EAF3DE]', text: 'text-[#3B6D11]', dotClass: 'dot-completed' },
  archived:  { label: 'مؤرشفة', bg: 'bg-[#F1EFE8]', text: 'text-[#5F5E5A]', dotClass: 'dot-archived' },
};

export default function CasesListScreen({ profile }: CasesListScreenProps) {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'active' | 'completed' | 'archived'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadCases() {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Error loading cases:', error);
      else setCases(data ?? []);
      setLoading(false);
    }
    loadCases();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filtered = cases.filter(c => {
    const matchSearch =
      c.title.includes(search) ||
      (c.client_name?.includes(search) ?? false) ||
      (c.category?.includes(search) ?? false);
    const matchFilter = activeFilter === 'all' || c.status === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FA] overflow-hidden" dir="rtl">

      {/* Page Header — Rounded Card Card Style */}
      <div className="px-8 pt-6 pb-2 flex-shrink-0">
        <div className="max-w-5xl mx-auto bg-white border border-[#E5E7EB] rounded-2xl px-8 py-5 flex items-center justify-between shadow-sm">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8EEF7] rounded-xl flex items-center justify-center">
              <FolderOpen size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F2937]">القضايا</h1>
              <p className="text-xs text-[#6B7280]">{cases.length} قضية في المجموع</p>
            </div>
          </div>

          {/* New Case Button — mirrors "+ New project" */}
          <button
            onClick={() => navigate('/cases/new')}
            className="flex items-center gap-2 bg-[#1B3A6B] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#2D4E87] transition-all shadow-md"
          >
            <Plus size={16} strokeWidth={1.5} />
            <span>قضية جديدة</span>
          </button>

        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto">

        {/* Search — mirrors Claude's search bar */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في القضايا..."
            className="w-full pr-11 pl-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-right text-sm text-[#1F2937] focus:outline-none focus:border-[#1B3A6B] transition-colors"
          />
        </div>

        {/* Filter tabs — mirrors Claude's Sort by */}
        <div className="flex items-center gap-2 mb-6 justify-end">
          {[
            { key: 'all',       label: 'الكل' },
            { key: 'new',       label: 'جديدة' },
            { key: 'active',    label: 'جارية' },
            { key: 'completed', label: 'مكتملة' },
            { key: 'archived', label: 'مؤرشفة'},
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeFilter === f.key
                  ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1B3A6B]/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cases Grid — mirrors Claude's projects grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B3A6B]" />
            <p className="mt-4 text-[#6B7280] text-sm font-medium">جاري تحميل القضايا...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-[#E8EEF7] rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen size={28} className="text-[#1B3A6B]" strokeWidth={1.5} />
            </div>
            <p className="text-[#1F2937] font-semibold mb-1">ما كاين حتى قضية</p>
            <p className="text-sm text-[#6B7280] mb-4">ابدأ بإضافة قضيتك الأولى</p>
            <button
              onClick={() => navigate('/cases/new')}
              className="flex items-center gap-2 bg-[#1B3A6B] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#2D4E87] transition-all"
            >
              <Plus size={16} strokeWidth={1.5} />
              <span>قضية جديدة</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(c => {
              const st = statusConfig[c.status as keyof typeof statusConfig];
              return (
<div key={c.id} className="relative group bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#1B3A6B]/40 hover:shadow-sm transition-all text-right">
  {/* Main clickable area - positioned absolutely to cover the card without nesting secondary buttons */}
  <div
    onClick={() => navigate(`/cases/${c.id}`)}
    className="absolute inset-0 z-0 cursor-pointer rounded-2xl"
    role="button"
    tabIndex={0}
    aria-label={`عرض تفاصيل: ${c.title}`}
  />

  {/* Content layer - relative and higher z-index */}
  <div className="relative z-10 pointer-events-none">
    {/* Card top */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2 pointer-events-auto">

        {/* 3-dot menu button */}
        <button
          onClick={e => {
            e.stopPropagation();
            setOpenMenuId(openMenuId === c.id ? null : c.id);
          }}
          title="خيارات إضافية"
          aria-label="خيارات إضافية"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1B3A6B] transition-all opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={15} strokeWidth={1.5} />
        </button>

        {/* Status badge */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dotClass}`}
          />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
            {st.label}
          </span>
        </div>

      </div>

      {/* Folder icon — right side */}
      <div className="flex items-center gap-1.5 pointer-events-none">
        {starredIds.includes(c.id) && (
          <Star size={14} className="text-[#C9A84C] fill-[#C9A84C]" strokeWidth={1.5} />
        )}
        <div className="w-9 h-9 bg-[#E8EEF7] rounded-xl flex items-center justify-center group-hover:bg-[#1B3A6B] transition-colors">
          <FolderOpen
            size={16}
            strokeWidth={1.5}
            className="text-[#1B3A6B] group-hover:text-white transition-colors"
          />
        </div>
      </div>
    </div>

    {/* Title */}
    <h3 className="font-bold text-[#1F2937] text-sm mb-1 leading-snug">
      {c.title}
    </h3>

    {/* Category */}
    <span className="inline-block text-xs bg-[#F7F8FA] border border-[#E5E7EB] text-[#6B7280] px-2 py-0.5 rounded-full mb-3">
      {c.category}
    </span>

    {/* Card footer */}
    <div className="border-t border-[#E5E7EB] pt-3 flex items-center justify-between">
      <div className="flex items-center gap-1 text-xs text-[#6B7280]">
        <Clock size={12} strokeWidth={1.5} />
        <span>{new Date(c.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'long' })}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
          <Calendar size={12} strokeWidth={1.5} />
          <span>{c.next_hearing ? new Date(c.next_hearing).toLocaleDateString('ar-MA') : 'غير محدد'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
          <User size={12} strokeWidth={1.5} />
          <span>{c.client_name || 'بدون اسم'}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Dropdown menu — renders outside the card button */}
  {openMenuId === c.id && (
    <div
      className="absolute left-2 top-12 z-50 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 min-w-[160px]"
      onClick={e => e.stopPropagation()}
    >
      {/* Star */}
      <button
        onClick={() => {
          setStarredIds(p =>
            p.includes(c.id) ? p.filter(id => id !== c.id) : [...p, c.id]
          );
          setOpenMenuId(null);
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F7F8FA] transition-colors"
      >
        <Star
          size={15}
          strokeWidth={1.5}
          className={starredIds.includes(c.id) ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-[#6B7280]'}
        />
        <span>{starredIds.includes(c.id) ? 'إلغاء التمييز' : 'تمييز'}</span>
      </button>

      {/* Edit */}
      <button
        onClick={() => {
          navigate(`/cases/${c.id}/edit`);
          setOpenMenuId(null);
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F7F8FA] transition-colors"
      >
        <Pencil size={15} strokeWidth={1.5} className="text-[#6B7280]" />
        <span>تعديل التفاصيل</span>
      </button>

      {/* Divider */}
      <div className="border-t border-[#E5E7EB] my-1" />

      {/* Change Status Section */}
      <div className="px-4 py-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider border-t border-[#F3F4F6]">تغيير الحالة</div>
      {[
        { key: 'new', label: 'قضية جديدة', icon: Circle, color: 'text-[#1B3A6B]' },
        { key: 'active', label: 'قضية جارية', icon: Clock, color: 'text-[#8B6914]' },
        { key: 'completed', label: 'قضية مكتملة', icon: CheckCircle, color: 'text-[#3B6D11]' },
      ].map(status => (
        <button
          key={status.key}
          onClick={async () => {
            const { error } = await supabase
              .from('cases')
              .update({ status: status.key })
              .eq('id', c.id);
            if (!error) {
              setCases(prev => prev.map(cs => cs.id === c.id ? { ...cs, status: status.key as any } : cs));
            }
            setOpenMenuId(null);
          }}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#F7F8FA] transition-colors ${c.status === status.key ? 'bg-[#E8EEF7] font-bold' : 'text-[#1F2937]'}`}
        >
          <status.icon size={14} className={status.color} />
          <span>{status.label}</span>
        </button>
      ))}

      {/* Archive */}
      <button
        onClick={async () => {
          const { error } = await supabase
            .from('cases')
            .update({ status: 'archived' })
            .eq('id', c.id);
          if (!error) {
            setCases(prev => prev.map(case_ =>
              case_.id === c.id ? { ...case_, status: 'archived' as any } : case_
            ));
          }
          setOpenMenuId(null);
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F7F8FA] transition-colors border-t border-[#F3F4F6] ${c.status === 'archived' ? 'bg-[#F1EFE8] font-bold' : 'text-[#1F2937]'}`}
      >
        <Archive size={15} strokeWidth={1.5} className="text-[#5F5E5A]" />
        <span>أرشفة القضية</span>
      </button>

      {/* Delete */}
      <button
        onClick={async () => {
          if (window.confirm('هل أنت متأكد من حذف هذه القضية نهائياً؟')) {
            const { error } = await supabase.from('cases').delete().eq('id', c.id);
            if (!error) setCases(prev => prev.filter(cs => cs.id !== c.id));
          }
          setOpenMenuId(null);
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-[#F3F4F6]"
      >
        <Trash2 size={15} strokeWidth={1.5} className="text-red-500" />
        <span>حذف نهائي</span>
      </button>
    </div>
  )}
</div>
              );
            })}
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
