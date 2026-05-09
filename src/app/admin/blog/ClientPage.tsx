'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, FileText, Calendar, Eye, Wand2, CheckCircle, Image as ImageIcon, Tag, Layout, Globe, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

const EMPTY_POST = { title: '', slug: '', content: '', excerpt: '', image: '', tags: '', status: 'published', seoTitle: '', seoKeywords: '', seoDescription: '' };

export default function BlogClientPage({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState({ ...EMPTY_POST });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  const router = useRouter();

  const openNew = () => { 
    setEditingPost(null); 
    setFormData({ ...EMPTY_POST }); 
    setActiveTab('content');
    setIsOpen(true); 
  };

  const handleEdit = async (post: any) => { 
    setActiveTab('content');
    setIsOpen(true); 
    setSaving(true);
    try {
      const id = post.id || post._id;
      const res = await fetch(`/api/blog/${id}`, { cache: 'no-store' });
      const full = await res.json();
      setEditingPost(full); 
      setFormData({ 
        ...EMPTY_POST, 
        ...full, 
        tags: full.tags?.join(', ') || '',
        seoTitle: full.seoTitle || '',
        seoKeywords: full.seoKeywords || '',
        seoDescription: full.seoDescription || '',
      }); 
    } catch (err) {
      alert('Không thể tải bài viết');
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: string, v: any) => setFormData(f => ({ ...f, [k]: v }));

  const refreshData = async () => {
    try {
      const res = await fetch('/api/blog', { cache: 'no-store' });
      const d = await res.json();
      if (Array.isArray(d)) setPosts(d);
      router.refresh();
    } catch (err) {
      console.error('Failed to refresh posts:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const dataToSend: any = { 
      ...formData, 
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) 
    };
    
    // Clean body
    delete dataToSend._id;
    delete dataToSend.id;
    delete dataToSend.__v;
    delete dataToSend.createdAt;
    delete dataToSend.updatedAt;

    const url = editingPost ? `/api/blog/${editingPost._id || editingPost.id}` : '/api/blog';
    
    try {
      const res = await fetch(url, { 
        method: editingPost ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(dataToSend) 
      });
      if (res.ok) {
        setIsOpen(false);
        await refreshData(); 
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi khi lưu bài viết');
      }
    } catch (err) {
      alert('Lỗi kết nối mạng');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bài viết này?')) return;
    try {
      await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => (p._id || p.id) !== id));
      router.refresh();
    } catch (err) {
      alert('Lỗi khi xóa bài viết');
    }
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt) return;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/writer', { 
        method: 'POST', 
        body: JSON.stringify({ prompt: aiPrompt, type: 'blog' }) 
      });
      const data = await res.json();
      if (data.content) { 
        set('content', data.content); 
        if (data.title) set('title', data.title); 
        if (data.excerpt) set('excerpt', data.excerpt); 
      }
    } catch (e) {}
    setAiGenerating(false);
  };

  const filtered = posts.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-fade-in space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Quản lý Bài viết
          </h1>
          <p className="text-[14px] text-slate-500 font-medium flex items-center gap-2">
            Hệ thống đang lưu trữ <span className="text-indigo-600 font-black">{posts.length} bài viết</span> chuyên sâu
          </p>
        </div>
        <Button onClick={openNew} className="gap-2.5 h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 text-sm font-bold">
          <Plus className="h-5 w-5" /> Viết bài mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Tìm bài viết theo tiêu đề hoặc từ khóa..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-100 text-sm text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/30 transition-all font-medium" 
          />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
             Sắp xếp: Mới nhất
           </span>
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-20 text-center">STT</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[400px]">Thông tin bài viết</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Ngày đăng</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-36 text-center">Trạng thái</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-28 text-center">Lượt xem</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((post, i) => (
                <tr key={post._id || post.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-300 group-hover:text-indigo-300 transition-colors">{((currentPage - 1) * itemsPerPage + i + 1).toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-14 rounded-[18px] bg-slate-100 border border-slate-200/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" /> : <FileText className="h-5 w-5 text-slate-300" />}
                      </div>
                      <div className="min-w-0 space-y-1.5">
                        <p className="font-extrabold text-slate-900 text-[16px] leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{post.title}</p>
                        <div className="flex items-center gap-2">
                          {post.tags?.slice(0, 3).map((t: string) => (
                            <span key={t} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100/30">#{t}</span>
                          ))}
                          {post.tags?.length > 3 && <span className="text-[9px] font-bold text-slate-400">+{post.tags.length - 3}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[12px] font-bold text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-300" />
                      {new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl border transition-all duration-300",
                      post.status === 'published' 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100 shadow-sm"
                    )}>
                      {post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700">
                      <Eye className="h-4 w-4 text-slate-300" />{post.views || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEdit(post)} 
                        className="w-10 h-10 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg hover:shadow-indigo-100 transition-all border border-transparent hover:border-slate-100"
                      >
                        <Pencil className="h-4.5 w-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post._id || post.id)} 
                        className="w-10 h-10 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg hover:shadow-red-100 transition-all border border-transparent hover:border-slate-100"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-[14px] text-slate-300 hover:text-indigo-600 transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-40 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner rotate-12 group-hover:rotate-0 transition-transform duration-500">
                      <FileText className="h-12 w-12 text-slate-300" />
                    </div>
                    <p className="text-[20px] font-black text-slate-800">Cây bút tài ba ơi...</p>
                    <p className="text-[14px] text-slate-500 mt-2 font-medium">Bạn chưa có bài viết nào phù hợp với tìm kiếm.</p>
                    <Button onClick={openNew} variant="outline" className="mt-8 rounded-2xl border-indigo-200 text-indigo-600 font-bold px-8 h-12 hover:bg-indigo-50 transition-all">
                      Viết ngay bài đầu tiên
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">
              Trang <span className="text-slate-900">{currentPage}</span> / {totalPages} — {filtered.length} kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="h-10 px-4 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-white"
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  if (pageNum <= 0 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                        currentPage === pageNum 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                          : "text-slate-500 hover:bg-white hover:text-indigo-600"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="h-10 px-4 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-white"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="lg" className="p-0 overflow-hidden border-none shadow-2xl rounded-[32px] max-w-5xl">
          <DialogHeader className="px-10 py-7 bg-slate-50/80 border-b border-slate-100">
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              {editingPost ? 'Chỉnh sửa bài viết' : 'Viết bài chuyên sâu'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-10 border-b border-slate-100 bg-slate-50/30">
                <TabsList className="h-14 bg-transparent gap-10">
                  {[
                    { val: 'content', label: 'Nội dung', icon: FileText },
                    { val: 'settings', label: 'Thiết lập', icon: Layout },
                    { val: 'seo', label: 'SEO Metadata', icon: Globe }
                  ].map(t => (
                    <TabsTrigger key={t.val} value={t.val} className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent bg-transparent text-[14px] font-bold text-slate-400 data-[state=active]:text-indigo-600 transition-all px-1 flex items-center gap-2.5">
                      <t.icon className="h-4 w-4" />{t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="overflow-y-auto px-10 py-10 max-h-[65vh]">
                <TabsContent value="content" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-indigo-600 rounded-[28px] p-8 shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                      <Wand2 className="h-32 w-32 text-white" />
                    </div>
                    <div className="relative z-10 space-y-5">
                      <div className="flex items-center gap-2.5 text-indigo-100 font-black text-[14px] uppercase tracking-widest">
                        <Sparkles className="h-4 w-4 text-amber-300" />Sáng tạo cùng AI Writer
                      </div>
                      <div className="flex gap-4">
                        <input 
                          className="flex-1 h-14 px-6 rounded-2xl border-none bg-white/10 text-white placeholder:text-indigo-200/60 text-base font-medium focus:ring-4 focus:ring-white/20 focus:outline-none transition-all backdrop-blur-md shadow-inner" 
                          placeholder="Bạn muốn viết về chủ đề gì hôm nay? (VD: Hướng dẫn săn sale Black Friday)" 
                          value={aiPrompt} 
                          onChange={e => setAiPrompt(e.target.value)} 
                        />
                        <Button type="button" onClick={handleGenerateAi} disabled={aiGenerating} className="bg-white hover:bg-indigo-50 text-indigo-600 font-black h-14 px-8 rounded-2xl shadow-lg transition-all active:scale-95 shrink-0">
                          {aiGenerating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Wand2 className="h-5 w-5 mr-2" />}
                          Tạo bản thảo
                        </Button>
                      </div>
                      <p className="text-[12px] text-indigo-200/80 font-medium italic">AI sẽ tự động đề xuất tiêu đề, tóm tắt và nội dung chi tiết dựa trên yêu cầu của bạn.</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[14px] font-black text-slate-800 ml-1 uppercase tracking-wider">Tiêu đề bài viết</Label>
                      <input 
                        className="w-full h-16 px-8 rounded-[24px] border border-slate-200 bg-white font-black text-[24px] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-200 tracking-tight" 
                        value={formData.title} 
                        onChange={e => set('title', e.target.value)} 
                        placeholder="Nhập tiêu đề thu hút người đọc..." 
                        required 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[14px] font-black text-slate-800 ml-1 uppercase tracking-wider">Nội dung chi tiết (Markdown/HTML)</Label>
                      <textarea 
                        className="w-full min-h-[500px] p-10 rounded-[32px] border border-slate-200 bg-slate-50/20 leading-relaxed font-medium text-[17px] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500/50 focus:outline-none transition-all resize-none shadow-inner" 
                        value={formData.content} 
                        onChange={e => set('content', e.target.value)} 
                        placeholder="Câu chuyện của bạn bắt đầu từ đây..." 
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[14px] font-black text-slate-800 ml-1 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-indigo-500" />Trạng thái hiển thị
                        </Label>
                        <select 
                          className="flex h-14 w-full rounded-2xl border border-slate-200 bg-white px-6 text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 cursor-pointer appearance-none shadow-sm" 
                          value={formData.status} 
                          onChange={e => set('status', e.target.value)}
                        >
                          <option value="published">Công khai ngay (Published)</option>
                          <option value="draft">Lưu bản nháp (Draft)</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[14px] font-black text-slate-800 ml-1 uppercase tracking-wider flex items-center gap-2">
                          <Layout className="h-4 w-4 text-indigo-500" />Đường dẫn tĩnh (Slug)
                        </Label>
                        <input 
                          className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner" 
                          value={formData.slug} 
                          onChange={e => set('slug', e.target.value)} 
                          placeholder="huong-dan-san-sale-shopee" 
                        />
                      </div>
                      <div className="space-y-3">
                        <ImageUpload 
                          label="Ảnh đại diện (Cover Image)" 
                          value={formData.image} 
                          onChange={(url) => set('image', url)} 
                        />
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[14px] font-black text-slate-800 ml-1 uppercase tracking-wider flex items-center gap-2">
                          <Tag className="h-4 w-4 text-indigo-500" />Phân loại (Tags)
                        </Label>
                        <input 
                          className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-sm" 
                          value={formData.tags} 
                          onChange={e => set('tags', e.target.value)} 
                          placeholder="VD: shopee, voucher, makeup (phân cách bằng dấu phẩy)" 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[14px] font-black text-slate-800 ml-1 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-500" />Tóm tắt bài viết (Excerpt)
                        </Label>
                        <textarea 
                          className="w-full h-[180px] p-6 rounded-2xl border border-slate-200 bg-white text-[14px] leading-relaxed font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-sm" 
                          value={formData.excerpt} 
                          onChange={e => set('excerpt', e.target.value)} 
                          placeholder="Một đoạn mô tả ngắn gọn giúp thu hút độc giả từ cái nhìn đầu tiên..." 
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4 mb-8">
                     <Globe className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                     <div className="space-y-1">
                       <p className="text-[15px] font-black text-amber-800 uppercase tracking-tight">Tối ưu hóa công cụ tìm kiếm</p>
                       <p className="text-[13px] text-amber-700/80 font-medium leading-relaxed">Cấu hình các thẻ meta giúp bài viết của bạn có thứ hạng cao hơn trên Google và hiển thị chuyên nghiệp hơn khi chia sẻ.</p>
                     </div>
                   </div>

                  <div className="space-y-8 max-w-3xl">
                    <div className="space-y-3">
                      <Label className="text-[14px] font-black text-slate-800 ml-1">SEO Meta Title</Label>
                      <Input 
                        value={formData.seoTitle} 
                        onChange={e => set('seoTitle', e.target.value)} 
                        placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm Google..." 
                        className="h-14 rounded-2xl border-slate-200 font-extrabold text-[16px] shadow-sm" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[14px] font-black text-slate-800 ml-1">SEO Meta Keywords</Label>
                      <Input 
                        value={formData.seoKeywords} 
                        onChange={e => set('seoKeywords', e.target.value)} 
                        placeholder="VD: voucher, giam gia, san sale (cách nhau bởi dấu phẩy)" 
                        className="h-14 rounded-2xl border-slate-200 font-bold shadow-sm" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[14px] font-black text-slate-800 ml-1">SEO Meta Description</Label>
                      <Textarea 
                        value={formData.seoDescription} 
                        onChange={e => set('seoDescription', e.target.value)} 
                        rows={5} 
                        placeholder="Mô tả nội dung bài viết hiển thị trên Google (tối ưu khoảng 150-160 ký tự)..." 
                        className="rounded-[24px] border-slate-200 p-6 font-medium text-[14px] shadow-sm leading-relaxed" 
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>

              <DialogFooter className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Hệ thống tự động lưu bản nháp sau mỗi 30s
                </div>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={saving} className="h-14 px-8 rounded-2xl font-black text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all">
                    Hủy bỏ
                  </Button>
                  <Button type="submit" disabled={saving} className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 font-black gap-3 min-w-[200px] transition-all active:scale-95">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                    {editingPost ? 'Cập nhật bài viết' : 'Đăng tải ngay'}
                  </Button>
                </div>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
