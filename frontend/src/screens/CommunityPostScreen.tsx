import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ThumbsUp, CheckCircle, Sparkles,
  Scale, Loader, MessageSquare, Plus, Send, Eye
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { Profile, ForumPost, ForumAnswer } from '../types';

interface CommunityPostScreenProps {
  profile: Profile | null;
}

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:8001';

export default function CommunityPostScreen({ profile }: CommunityPostScreenProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [answers, setAnswers] = useState<ForumAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    if (!id) return;
    loadPost();
    loadAnswers();
    loadUserVotes();
    incrementViews();
  }, [id]);

  async function loadPost() {
    const { data } = await supabase
      .from('forum_posts').select('*').eq('id', id).single();
    setPost(data);
    setLoading(false);
  }

  async function loadAnswers() {
    const { data } = await supabase
      .from('forum_answers')
      .select('*')
      .eq('post_id', id)
      .order('is_best_answer', { ascending: false })
      .order('votes', { ascending: false });
    setAnswers(data ?? []);
  }

  async function loadUserVotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('forum_votes')
      .select('answer_id, type')
      .eq('user_id', user.id);
    const map: Record<string, 'up' | 'down'> = {};
    (data ?? []).forEach(v => { map[v.answer_id] = v.type; });
    setUserVotes(map);
  }

  async function incrementViews() {
    await supabase.rpc('increment_post_views', { post_id: id });
  }

  async function handleVote(answerId: string, type: 'up' | 'down') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = userVotes[answerId];

    if (existing === type) {
      // Remove vote
      await supabase.from('forum_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('answer_id', answerId);
      setUserVotes(prev => {
        const next = { ...prev };
        delete next[answerId];
        return next;
      });
    } else {
      // Upsert vote
      await supabase.from('forum_votes').upsert({
        user_id: user.id,
        answer_id: answerId,
        type,
      }, { onConflict: 'user_id,answer_id' });
      setUserVotes(prev => ({ ...prev, [answerId]: type }));
    }
    loadAnswers();
  }

  async function markBestAnswer(answerId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== post?.user_id) return;

    await supabase.from('forum_answers')
      .update({ is_best_answer: false })
      .eq('post_id', id);

    await supabase.from('forum_answers')
      .update({ is_best_answer: true })
      .eq('id', answerId);

    await supabase.from('forum_posts')
      .update({ is_resolved: true })
      .eq('id', id);

    loadPost();
    loadAnswers();
  }

  async function submitAnswer() {
    if (!newAnswer.trim()) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    await supabase.from('forum_answers').insert({
      post_id: id,
      user_id: user.id,
      content: newAnswer.trim(),
      is_ai: false,
      is_best_answer: false,
    });

    // Notify post owner
    if (post && post.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        type: 'new_answer',
        title: 'جواب جديد على سؤالك',
        body: newAnswer.trim().slice(0, 100),
        link: `/community/${id}`,
      });
    }

    setNewAnswer('');
    setSubmitting(false);
    loadAnswers();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="animate-spin text-[#1B3A6B]" strokeWidth={1.5} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-[#6B7280]">السؤال غير موجود</p>
        <button onClick={() => navigate('/community')} className="mt-4 text-[#1B3A6B] text-sm font-bold underline">
          العودة للمنتدى
        </button>
      </div>
    );
  }

  const aiAnswer = answers.find(a => a.is_ai);
  const humanAnswers = answers.filter(a => !a.is_ai);

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">

      {/* Back */}
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1B3A6B] transition-colors"
      >
        <ArrowRight size={16} strokeWidth={1.5} />
        العودة للمنتدى
      </button>

      {/* Question */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          {post.is_resolved && (
            <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle size={10} strokeWidth={2} />محلول
            </span>
          )}
          {post.category && (
            <span className="text-[10px] bg-[#E8EEF7] text-[#1B3A6B] font-bold px-2 py-0.5 rounded-full">
              {post.category}
            </span>
          )}
        </div>
        <h1 className="text-lg font-black text-[#1F2937] mb-3">{post.title}</h1>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{post.content}</p>
        <div className="flex items-center gap-4 text-[10px] text-[#9CA3AF] border-t border-[#F3F4F6] pt-3">
          <div className="flex items-center gap-1">
            <Eye size={11} strokeWidth={1.5} />
            <span>{post.views} مشاهدة</span>
          </div>
          <span>{new Date(post.created_at).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>{post.is_anonymous ? 'مواطن مجهول' : 'مواطن'}</span>
        </div>
      </div>

      {/* AI Answer */}
      {aiAnswer && (
        <div className="bg-[#E8EEF7]/50 border border-[#1B3A6B]/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#1B3A6B] rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-black text-[#1B3A6B]">جواب حقي AI</span>
            <span className="text-[9px] bg-[#1B3A6B]/10 text-[#1B3A6B] px-2 py-0.5 rounded-full font-bold">
              جواب فوري
            </span>
          </div>
          <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
            {aiAnswer.content}
          </p>
        </div>
      )}

      {/* Human answers */}
      {humanAnswers.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
            {humanAnswers.length} {humanAnswers.length === 1 ? 'جواب' : 'أجوبة'} من الخبراء والمجتمع
          </p>
          {humanAnswers.map(answer => (
            <div
              key={answer.id}
              className={`bg-white border rounded-2xl p-5 ${
                answer.is_best_answer
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-[#E5E7EB]'
              }`}
            >
              {answer.is_best_answer && (
                <div className="flex items-center gap-1.5 mb-3 text-green-600">
                  <CheckCircle size={14} strokeWidth={1.5} />
                  <span className="text-xs font-black">أفضل جواب</span>
                </div>
              )}
              <p className="text-sm text-[#374151] leading-relaxed mb-4 whitespace-pre-wrap">
                {answer.content}
              </p>
              <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-3">
                {/* Voting */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(answer.id, 'up')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      userVotes[answer.id] === 'up'
                        ? 'bg-[#1B3A6B] text-white'
                        : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#E8EEF7] hover:text-[#1B3A6B]'
                    }`}
                  >
                    <ThumbsUp size={12} strokeWidth={1.5} />
                    <span>{answer.votes > 0 ? answer.votes : ''} مفيد</span>
                  </button>

                  {/* Mark best answer — only post owner */}
                  {!answer.is_best_answer && (
                    <button
                      onClick={() => markBestAnswer(answer.id)}
                      className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-green-600 transition-colors px-2 py-1"
                    >
                      <CheckCircle size={11} strokeWidth={1.5} />
                      أفضل جواب
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-[#9CA3AF]">
                  {new Date(answer.created_at).toLocaleDateString('ar-MA', {
                    month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add answer */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
          <MessageSquare size={15} className="text-[#1B3A6B]" strokeWidth={1.5} />
          أضف جوابك
        </h3>
        <textarea
          value={newAnswer}
          onChange={e => setNewAnswer(e.target.value)}
          placeholder="شارك تجربتك أو معرفتك القانونية بالدارجة أو العربية..."
          rows={4}
          className="w-full px-4 py-3 bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl text-sm outline-none transition-all resize-none mb-3"
        />
        <button
          onClick={submitAnswer}
          disabled={!newAnswer.trim() || submitting}
          className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#2D4E87] disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
        >
          {submitting ? (
            <><Loader size={14} className="animate-spin" strokeWidth={1.5} />جاري النشر...</>
          ) : (
            <><Send size={14} strokeWidth={1.5} />نشر الجواب</>
          )}
        </button>
      </div>

    </div>
  );
}
