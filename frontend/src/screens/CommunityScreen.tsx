import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Plus, Search, ChevronLeft,
  Loader, Users, TrendingUp, CheckCircle,
  Eye, ThumbsUp, Scale, Sparkles, BookOpen
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { Profile, ForumPost } from '../types';

interface CommunityScreenProps {
  profile: Profile | null;
}

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:8001';

const CATEGORIES = [
  'الكل', 'قانون الشغل', 'قانون الأسرة',
  'الملكية العقارية', 'القانون التجاري',
  'المسطرة المدنية', 'القانون الجنائي',
  'القانون الإداري', 'الحماية الاجتماعية',
];

export default function CommunityScreen({ profile }: CommunityScreenProps) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [showNewPost, setShowNewPost] = useState(false);
  const [stats, setStats] = useState({ total: 0, resolved: 0, experts: 0 });

  useEffect(() => {
    loadPosts();
    loadStats();
  }, [search, activeCategory]);

  async function loadPosts() {
    setLoading(true);
    let query = supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (activeCategory !== 'الكل') {
      query = query.eq('category', activeCategory);
    }
    if (search.trim()) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data } = await query;
    setPosts(data ?? []);
    setLoading(false);
  }

  async function loadStats() {
    const { count: total } = await supabase
      .from('forum_posts').select('*', { count: 'exact', head: true });
    const { count: resolved } = await supabase
      .from('forum_posts').select('*', { count: 'exact', head: true })
      .eq('is_resolved', true);
    const { count: experts } = await supabase
      .from('lawyer_profiles').select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    setStats({
      total: total ?? 0,
      resolved: resolved ?? 0,
      experts: experts ?? 0,
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <Users size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
            منتدى المجتمع
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            اسأل، أجب، وتواصل مع خبراء القانون المغربي
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/community/lawyers')}
            className="flex items-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#1B3A6B] text-[#1B3A6B] text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <Scale size={15} strokeWidth={1.5} />
            دليل المحامين
          </button>
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2D4E87] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Plus size={15} strokeWidth={1.5} />
            طرح سؤال
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: MessageSquare, label: 'سؤال مطروح', value: stats.total },
          { icon: CheckCircle,   label: 'تم حلها',    value: stats.resolved },
          { icon: Scale,         label: 'خبير نشيط',  value: stats.experts },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E8EEF7] rounded-xl flex items-center justify-center flex-shrink-0">
              <s.icon size={16} className="text-[#1B3A6B]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-black text-[#1F2937]">{s.value}</p>
              <p className="text-[10px] text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} strokeWidth={1.5}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث في الأسئلة..."
          className="w-full pr-11 pl-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-right focus:outline-none focus:border-[#1B3A6B] transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1B3A6B]/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size={24} className="animate-spin text-[#1B3A6B]" strokeWidth={1.5} />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#E8EEF7] rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-[#1B3A6B]" strokeWidth={1.5} />
          </div>
          <p className="text-[#1F2937] font-semibold mb-1">ما كاين حتى سؤال بعد</p>
          <p className="text-sm text-[#6B7280] mb-4">كن أول من يطرح سؤالاً!</p>
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 bg-[#1B3A6B] text-white text-sm font-bold px-5 py-2.5 rounded-xl"
          >
            <Plus size={15} strokeWidth={1.5} />
            طرح سؤال جديد
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => navigate(`/community/${post.id}`)}
            />
          ))}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <NewPostModal
          profile={profile}
          onClose={() => setShowNewPost(false)}
          onPosted={() => { setShowNewPost(false); loadPosts(); }}
        />
      )}
    </div>
  );
}

// ── PostCard ─────────────────────────────────────────────────────
function PostCard({ post, onClick }: { post: ForumPost; onClick: () => void }) {
  const [answerCount, setAnswerCount] = useState(0);

  useEffect(() => {
    supabase
      .from('forum_answers')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
      .then(({ count }) => setAnswerCount(count ?? 0));
  }, [post.id]);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#E5E7EB] rounded-2xl p-5 text-right hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Left meta */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-1">
          <div className="flex flex-col items-center">
            <span className="text-base font-black text-[#1B3A6B]">{answerCount}</span>
            <span className="text-[9px] text-[#9CA3AF]">جواب</span>
          </div>
          {post.is_resolved && (
            <CheckCircle size={16} className="text-green-500" strokeWidth={1.5} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {post.is_resolved && (
              <span className="text-[9px] bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full">
                محلول
              </span>
            )}
            {post.category && (
              <span className="text-[9px] bg-[#E8EEF7] text-[#1B3A6B] font-bold px-2 py-0.5 rounded-full">
                {post.category}
              </span>
            )}
          </div>
          <h3 className="font-bold text-[#1F2937] text-sm mb-1 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-[#6B7280] line-clamp-1 mb-3">
            {post.content}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
              <Eye size={12} strokeWidth={1.5} />
              <span>{post.views}</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF]">
              {new Date(post.created_at).toLocaleDateString('ar-MA', {
                month: 'short', day: 'numeric'
              })}
            </span>
            <span className="text-[10px] text-[#9CA3AF]">
              {post.is_anonymous ? 'مواطن مجهول' : 'مواطن'}
            </span>
          </div>
        </div>

        <ChevronLeft size={16} className="text-[#E5E7EB] flex-shrink-0 mt-1" strokeWidth={1.5} />
      </div>
    </button>
  );
}

// ── NewPostModal ──────────────────────────────────────────────────
function NewPostModal({ profile, onClose, onPosted }: {
  profile: Profile | null;
  onClose: () => void;
  onPosted: () => void;
}) {
  const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:8001';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES_SELECT = [
    'قانون الشغل', 'قانون الأسرة', 'الملكية العقارية',
    'القانون التجاري', 'المسطرة المدنية', 'القانون الجنائي',
    'القانون الإداري', 'الحماية الاجتماعية',
  ];

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    // 1. Insert post
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category: category || null,
        is_anonymous: isAnonymous,
        tags: [],
      })
      .select()
      .single();

    if (error || !post) { setSubmitting(false); return; }

    // 2. Auto-generate AI answer via bridge
    try {
      const response = await fetch(`${BRIDGE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${title}\n\n${content}`,
          history: [],
          legal_level: profile?.legal_level ?? 'citizen',
          domain: category || null,
          conversation_id: null,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        await supabase.from('forum_answers').insert({
          post_id: post.id,
          user_id: null,
          content: data.reply,
          is_ai: true,
          is_best_answer: false,
        });
      }
    } catch {
      // Silent fail — post still created
    }

    setSubmitting(false);
    onPosted();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] text-xl">✕</button>
            <h3 className="font-bold text-[#1F2937]">طرح سؤال جديد</h3>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4" dir="rtl">
            <div>
              <label className="text-xs font-bold text-[#1F2937] block mb-1.5">
                عنوان السؤال *
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: واش يمكن لصاحب الدار يخرجني بدون إشعار؟"
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm outline-none transition-all"
                maxLength={200}
              />
              <p className="text-[10px] text-[#9CA3AF] mt-1 text-left">
                {title.length}/200
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937] block mb-1.5">
                تفاصيل السؤال *
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="اشرح وضعيتك بالتفصيل — أكثر تفاصيل = أحسن جواب"
                rows={4}
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937] block mb-1.5">
                التخصص القانوني
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm outline-none transition-all"
              >
                <option value="">اختر التخصص (اختياري)</option>
                {CATEGORIES_SELECT.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between py-2">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isAnonymous ? 'bg-[#1B3A6B]' : 'bg-[#E5E7EB]'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  isAnonymous ? 'left-5' : 'left-0.5'
                }`} />
              </button>
              <div className="text-right">
                <p className="text-xs font-bold text-[#1F2937]">نشر بشكل مجهول</p>
                <p className="text-[10px] text-[#6B7280]">لن يظهر اسمك مع السؤال</p>
              </div>
            </div>

            {/* AI badge */}
            <div className="flex items-center gap-2 bg-[#E8EEF7] rounded-xl px-3 py-2">
              <Sparkles size={13} className="text-[#1B3A6B]" strokeWidth={1.5} />
              <p className="text-[10px] text-[#1B3A6B] font-medium">
                سيتلقى سؤالك جواباً فورياً من حقي AI، إضافة إلى إجابات الخبراء
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || submitting}
              className="w-full bg-[#1B3A6B] hover:bg-[#2D4E87] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? (
                <><Loader size={16} className="animate-spin" strokeWidth={1.5} />جاري النشر...</>
              ) : (
                <><Plus size={16} strokeWidth={1.5} />نشر السؤال</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
