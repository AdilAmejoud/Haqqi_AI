import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, Trash2, ArrowRight,
  FolderOpen, Loader, Search, Plus
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { Profile } from '../types';

interface SavedDocumentsScreenProps {
  profile: Profile | null;
}

interface SavedDocument {
  id: string;
  title: string;
  type: string;
  content: string;
  created_at: string;
}

export default function SavedDocumentsScreen({ profile }: SavedDocumentsScreenProps) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [preview, setPreview] = useState<SavedDocument | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setDocs(data ?? []);
    setLoading(false);
  }

  async function deleteDoc(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
    setDeleting(id);
    await supabase.from('documents').delete().eq('id', id);
    setDocs(prev => prev.filter(d => d.id !== id));
    setDeleting(null);
  }

  function downloadDoc(doc: SavedDocument) {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}-حقي-AI.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const filtered = docs.filter(d =>
    d.title.includes(search) || d.type?.includes(search)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/documents')}
          className="p-2 hover:bg-[#E8EEF7] rounded-full text-[#6B7280] transition-colors"
        >
          <ArrowRight size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <FolderOpen size={20} className="text-[#1B3A6B]" strokeWidth={1.5} />
            مستنداتي المحفوظة
          </h1>
          <p className="text-xs text-[#6B7280]">{docs.length} مستند محفوظ</p>
        </div>
        <button
          onClick={() => navigate('/documents/generate')}
          className="flex items-center gap-2 bg-[#1B3A6B] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#2D4E87] transition-all"
        >
          <Plus size={15} strokeWidth={1.5} />
          مستند جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.5}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث في مستنداتك..."
          className="w-full pr-11 pl-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-right focus:outline-none focus:border-[#1B3A6B] transition-colors"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-[#1B3A6B]" strokeWidth={1.5} />
        </div>
      )}

      {/* Empty state */}
      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#E8EEF7] rounded-2xl flex items-center justify-center mb-4">
            <FolderOpen size={28} className="text-[#1B3A6B]" strokeWidth={1.5} />
          </div>
          <p className="text-[#1F2937] font-semibold mb-1">ما كاين حتى مستند محفوظ</p>
          <p className="text-sm text-[#6B7280] mb-4">ولّد مستندك الأول وسيُحفظ هنا تلقائياً</p>
          <button
            onClick={() => navigate('/documents/generate')}
            className="flex items-center gap-2 bg-[#1B3A6B] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#2D4E87] transition-all"
          >
            <Plus size={16} strokeWidth={1.5} />
            توليد مستند جديد
          </button>
        </div>
      )}

      {/* Documents list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div
              key={doc.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-4 hover:border-[#1B3A6B]/30 transition-all"
            >
              {/* Icon */}
              <div className="w-11 h-11 bg-[#E8EEF7] rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-[#1B3A6B]" strokeWidth={1.5} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-right">
                <h3 className="font-bold text-[#1F2937] text-sm truncate">{doc.title}</h3>
                <div className="flex items-center gap-2 justify-end mt-0.5">
                  {doc.type && (
                    <span className="text-[10px] bg-[#F7F8FA] border border-[#E5E7EB] text-[#6B7280] px-2 py-0.5 rounded-lg">
                      {doc.type}
                    </span>
                  )}
                  <span className="text-[10px] text-[#9CA3AF]">
                    {new Date(doc.created_at).toLocaleDateString('ar-MA', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setPreview(doc)}
                  className="p-2 text-[#6B7280] hover:text-[#1B3A6B] hover:bg-[#E8EEF7] rounded-lg transition-all"
                  title="معاينة"
                >
                  <FileText size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => downloadDoc(doc)}
                  className="p-2 text-[#6B7280] hover:text-[#1B3A6B] hover:bg-[#E8EEF7] rounded-lg transition-all"
                  title="تحميل"
                >
                  <Download size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => deleteDoc(doc.id)}
                  disabled={deleting === doc.id}
                  className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                  title="حذف"
                >
                  {deleting === doc.id
                    ? <Loader size={16} className="animate-spin" strokeWidth={1.5} />
                    : <Trash2 size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div
              className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ width: '90vw', maxWidth: '700px', maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
                <button
                  onClick={() => downloadDoc(preview)}
                  className="flex items-center gap-2 text-xs text-[#1B3A6B] font-bold hover:underline"
                >
                  <Download size={14} strokeWidth={1.5} />
                  تحميل
                </button>
                <h3 className="font-bold text-[#1F2937] text-sm">{preview.title}</h3>
                <button
                  onClick={() => setPreview(null)}
                  className="text-[#6B7280] hover:text-[#1F2937] text-lg leading-none"
                >✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <pre className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap text-right font-sans">
                  {preview.content}
                </pre>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
