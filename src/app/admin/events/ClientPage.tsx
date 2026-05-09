'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, Calendar, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
const EMPTY = { name: '', slug: '', link: '', icon: '', status: 'active', seoTitle: '', seoKeywords: '', seoDescription: '' };

export default function EventsClientPage({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  const toSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    const slug = toSlug(name);
    set('name', name);
    if (!formData.slug || formData.slug === toSlug(formData.name)) {
      set('slug', slug);
      set('link', `/event/${slug}`);
    }
  };

  const handleSlugChange = (slug: string) => {
    set('slug', slug);
    set('link', `/event/${slug}`);
  };

  const openNew = () => {
    setEditingEvent(null);
    setFormData({ ...EMPTY });
    setActiveTab('basic');
    setIsOpen(true);
  };

  const handleEdit = async (ev: any) => { 
    setActiveTab('basic');
    setIsOpen(true); 
    setSaving(true);
    try {
      const id = ev.id || ev._id;
      const res = await fetch(`/api/events/${id}`, { cache: 'no-store' });
      const full = await res.json();
      setEditingEvent(full);
      const slug = full.slug || toSlug(full.name || '');
      setFormData({
        ...EMPTY,
        ...full,
        slug,
        link: `/event/${slug}`,
        seoTitle: full.seoTitle || '',
        seoKeywords: full.seoKeywords || '',
        seoDescription: full.seoDescription || '',
      }); 
    } catch (err) {
      alert('Không thể tải sự kiện');
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: string, v: any) => setFormData(f => ({ ...f, [k]: v }));

  const refreshData = async () => {
    try {
      const res = await fetch('/api/events', { cache: 'no-store' });
      const d = await res.json();
      if (Array.isArray(d)) setEvents(d);
    } catch (err) {
      console.error('Failed to refresh events:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: any = { ...formData };
    delete body._id;
    delete body.id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;

    const eventId = editingEvent?.id || editingEvent?._id;
    const url = eventId ? `/api/events/${eventId}` : '/api/events';
    try {
      const res = await fetch(url, {
        method: eventId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const saved = await res.json();
        setIsOpen(false);
        if (eventId) {
          setEvents(prev => prev.map(e => (e.id || e._id) === eventId ? { ...e, ...saved } : e));
        } else {
          setEvents(prev => [saved, ...prev]);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi khi lưu');
      }
    } catch (err) {
      alert('Lỗi kết nối mạng');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sự kiện này?')) return;
    setEvents(prev => prev.filter(e => (e.id || e._id) !== id));
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (!res.ok) refreshData();
    } catch (err) {
      alert('Lỗi khi xóa');
      refreshData();
    }
  };

  const filtered = events.filter(ev => ev.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Quản lý Sự kiện
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Bạn có tổng cộng {events.length} sự kiện trong hệ thống</p>
        </div>
        <Button onClick={openNew} className="gap-2 h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 text-sm font-bold">
          <Plus className="h-5 w-5" /> Thêm Sự kiện
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Tìm nhanh tên sự kiện..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-100 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all font-medium" 
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-bottom border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Icon</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[280px]">Sự kiện</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[300px]">Đường dẫn (Link)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right w-32 pr-8">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(ev => (
                <tr key={ev.id || ev._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm mx-auto group-hover:scale-110 transition-transform duration-200">
                      {ev.icon || '🔥'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 text-[15px] leading-tight group-hover:text-indigo-600 transition-colors">{ev.name}</p>
                      {ev.slug && <p className="text-[11px] font-bold text-slate-400 mt-1 font-mono">{ev.slug}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer max-w-xs truncate">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="truncate">{ev.link}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                      ev.status === 'active' 
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                        : "text-slate-400 bg-slate-100 border-slate-200"
                    )}>
                      {ev.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-5 pr-8 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button 
                        onClick={() => handleEdit(ev)} 
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-sm transition-all border border-transparent hover:border-indigo-100"
                      >
                        <Pencil className="h-4.5 w-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(ev.id || ev._id)} 
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-sm transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-inner">
                      <Calendar className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-[18px] font-black text-slate-800">Không tìm thấy sự kiện nào</p>
                    <p className="text-[14px] text-slate-500 mt-2 font-medium">Thử thay đổi bộ lọc hoặc thêm sự kiện mới.</p>
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

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="lg" className="p-0 overflow-hidden border-none shadow-2xl rounded-[28px]">
          <DialogHeader className="px-8 py-6 bg-slate-50/80 border-b border-slate-100">
            <DialogTitle className="text-xl font-black text-slate-900">{editingEvent ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện mới'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col overflow-hidden bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-8 border-b border-slate-100 bg-slate-50/30">
                <TabsList className="h-12 bg-transparent gap-8">
                  <TabsTrigger value="basic" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent bg-transparent text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all px-1">Thông tin cơ bản</TabsTrigger>
                  <TabsTrigger value="seo" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent bg-transparent text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all px-1">SEO Metadata</TabsTrigger>
                </TabsList>
              </div>

              <div className="overflow-y-auto px-8 py-8 max-h-[60vh]">
                <TabsContent value="basic" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Tên sự kiện <span className="text-red-500">*</span></Label>
                        <Input
                          value={formData.name}
                          onChange={e => handleNameChange(e.target.value)}
                          placeholder="VD: Black Friday, Giáng Sinh"
                          required
                          className="h-12 rounded-2xl border-slate-200 font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Slug (đường dẫn)</Label>
                        <Input
                          value={formData.slug}
                          onChange={e => handleSlugChange(e.target.value)}
                          placeholder="VD: black-friday"
                          className="h-12 rounded-2xl border-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">URL trang sự kiện <span className="text-slate-400 font-normal">(tự sinh từ slug)</span></Label>
                      <Input
                        value={formData.link}
                        readOnly
                        className="h-12 rounded-2xl border-slate-200 text-sm text-blue-600 font-mono bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Emoji Icon</Label>
                        <Input 
                          value={formData.icon} 
                          onChange={e => set('icon', e.target.value)} 
                          placeholder="VD: 🎁, 🔥, ⚡" 
                          className="h-12 rounded-2xl border-slate-200 text-lg text-center w-24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Trạng thái</Label>
                        <select 
                          value={formData.status} 
                          onChange={e => set('status', e.target.value)}
                          className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 cursor-pointer appearance-none"
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Tạm dừng</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">SEO Title Tag</Label>
                      <Input 
                        value={formData.seoTitle} 
                        onChange={e => set('seoTitle', e.target.value)} 
                        placeholder="Tiêu đề hiển thị trên Google..." 
                        className="h-12 rounded-2xl border-slate-200 font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">SEO Keywords</Label>
                      <Input 
                        value={formData.seoKeywords} 
                        onChange={e => set('seoKeywords', e.target.value)} 
                        placeholder="VD: giam gia, black friday, khuyen mai..." 
                        className="h-12 rounded-2xl border-slate-200 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">SEO Meta Description</Label>
                      <Textarea 
                        value={formData.seoDescription} 
                        onChange={e => set('seoDescription', e.target.value)} 
                        rows={4} 
                        placeholder="Mô tả ngắn hiển thị dưới link trên Google..." 
                        className="rounded-[20px] border-slate-200 p-4 font-medium"
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>

              <DialogFooter className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={saving} className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                  Hủy bỏ
                </Button>
                <Button type="submit" disabled={saving} className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold gap-2 min-w-[140px]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {editingEvent ? 'Lưu thay đổi' : 'Tạo sự kiện'}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
