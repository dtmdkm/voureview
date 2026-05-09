'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, Sparkles, ExternalLink, Store, CheckCircle2, Star, ChevronRight } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const AVATAR_PALETTE = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
  'bg-teal-500', 'bg-orange-500', 'bg-lime-500', 'bg-sky-500',
];

const FAQ_TEMPLATES = (storeName: string) => [
  { question: `Why should I visit Voureview for ${storeName} coupons?`, answer: `Voureview collects the top discounts from ${storeName}, even at the last minute while updating continually to ensure consumer savings.` },
  { question: `Where to find ${storeName} promo codes?`, answer: `Right on the website of ${storeName} or join Voureview for more options of ${storeName} promo codes.` },
  { question: `Will all ${storeName} discounts automatically be applied at checkout?`, answer: `No. It depends on each ${storeName} deal. Some require you to apply a code at discount field while some are applied automatically.` },
  { question: `Are there any ${storeName} Gift Cards available?`, answer: `If a ${storeName} Gift Card is available, it will be aggregated above. Let's check!` },
  { question: `Can you give me a guide for using ${storeName} coupon codes?`, answer: `Copy the coupon code, navigate to ${storeName}, add items to cart, apply code at checkout and enjoy saving.` },
  { question: `Is there any ${storeName} coupons for new customers?`, answer: `New consumers can easily find many ${storeName} coupons on Voureview.` },
  { question: `Can I submit ${storeName} coupons?`, answer: `Voureview allows all people to submit their own coupons. Click "Submit Coupon" at the top of the website.` },
  { question: `How many ${storeName} coupons is each customer allowed to use?`, answer: `You should check ${storeName} for detailed information because it is changed often.` },
  { question: `When does ${storeName} release new promo codes?`, answer: `New ${storeName} promo codes are updated continuously on Voureview.` },
  { question: `Can I use ${storeName} coupons for all products?`, answer: `Most ${storeName} coupons are only valid for certain products. Please check the "Details" section.` },
];

interface ClientPageProps {
  initialStores: any[];
  categories: any[];
  events: any[];
  dealStats: Record<string, { count: number; clicks: number }>;
}

export default function ClientPage({ initialStores, categories, events, dealStats }: ClientPageProps) {
  const [stores, setStores] = useState(initialStores);
  const [isOpen, setIsOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [image, setImage] = useState('');
  const [banner, setBanner] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingStore((prev: any) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const refreshData = async () => {
    const res = await fetch('/api/stores?list=1', { cache: 'no-store' });
    const d = await res.json();
    if (Array.isArray(d)) setStores(d);
  };

  const openModal = async (store: any = null) => {
    setIsOpen(true);
    if (store) {
      // Set initial data immediately so user sees something
      const initial = {
        name: store.name || '',
        slug: store.slug || '',
        link: store.link || '',
        description: store.description || '',
        content: store.content || '',
        seoTitle: store.seoTitle || '',
        seoKeywords: store.seoKeywords || '',
        seoDescription: store.seoDescription || '',
        categoryId: store.categoryId || '',
        eventId: store.eventId || '',
        rating: store.rating || 5,
        status: store.status || 'active',
      };
      setEditingStore({ ...initial, id: store.id || store._id });
      setImage(store.image || '');
      setBanner(store.banner || '');
      setFaqs(store.faqs || []);
      setIsApproved(store.isApproved !== false);
      setIsFeatured(!!store.isFeatured);

      try {
        const id = store.id || store._id;
        const res = await fetch(`/api/stores/${id}?t=${Date.now()}`, { cache: 'no-store' });
        const full = await res.json();
        setEditingStore(full);
        setImage(full.image || '');
        setBanner(full.banner || '');
        setFaqs(full.faqs || []);
        setIsApproved(full.isApproved !== false);
        setIsFeatured(!!full.isFeatured);
      } catch {
        // Fallback already set
      }
    } else {
      setEditingStore({
        name: '',
        slug: '',
        link: '',
        description: '',
        content: '',
        seoTitle: '',
        seoKeywords: '',
        seoDescription: '',
        categoryId: '',
        eventId: '',
        rating: 5,
        status: 'active',
      });
      setImage('');
      setBanner('');
      setFaqs([]);
      setIsApproved(true);
      setIsFeatured(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStore) return;
    setSaving(true);

    const body: any = {
      ...editingStore,
      image,
      banner,
      isApproved,
      isFeatured,
      faqs,
      rating: Number(editingStore.rating) || 5
    };
    // Clean body
    delete body._id;
    delete body.id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;
    // ObjectId fields must not be empty string — delete if unset
    if (!body.categoryId) delete body.categoryId;
    if (!body.eventId) delete body.eventId;

    const storeId = editingStore?.id || editingStore?._id;
    const res = await fetch(storeId ? `/api/stores/${storeId}` : '/api/stores', {
      method: storeId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const saved = await res.json();
      setIsOpen(false);
      if (storeId) {
        setStores(prev => prev.map(s => (s.id || s._id) === storeId ? { ...s, ...saved } : s));
      } else {
        setStores(prev => [saved, ...prev]);
      }
    } else {
      const err = await res.json();
      alert(err.error || 'Lỗi khi lưu');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa cửa hàng này?')) return;
    setStores(prev => prev.filter(s => (s.id || s._id) !== id));
    const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
    if (!res.ok) refreshData();
  };

  const handleToggleStatus = async (store: any) => {
    const id = store.id || store._id;
    setTogglingId(id);
    const newStatus = store.status === 'active' ? 'inactive' : 'active';
    setStores(prev => prev.map(s => (s.id || s._id) === id ? { ...s, status: newStatus } : s));
    const res = await fetch(`/api/stores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) refreshData();
    setTogglingId(null);
  };

  const handleGenerateStoreIntro = async () => {
    if (!editingStore?.name) return alert('Vui lòng nhập tên Cửa hàng trước!');
    const name = editingStore.name;
    const catId = editingStore.categoryId;
    const catName = categories.find(c => (c.id || c._id) === catId)?.name || 'Shopping';
    const desc = editingStore.description || '';

    setGeneratingAI(true);
    try {
      const res = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'store_intro', brandName: name, categoryName: catName, description: desc }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setEditingStore((prev: any) => ({ ...prev, content: data.content }));
      if (!banner && data.image) setBanner(data.image);
      alert('Đã tạo nội dung thành công!');
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const [generatingShortAI, setGeneratingShortAI] = useState(false);
  const handleGenerateShortDesc = async () => {
    if (!editingStore?.name) return alert('Vui lòng nhập tên Cửa hàng trước!');
    const name = editingStore.name;
    const detailContent = editingStore.content || '';

    setGeneratingShortAI(true);
    try {
      const res = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'store_short', brandName: name, description: detailContent }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setEditingStore((prev: any) => ({ ...prev, description: data.content }));
      alert('Đã tạo mô tả ngắn thành công!');
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setGeneratingShortAI(false);
    }
  };

  const filtered = stores.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeCount = stores.filter(s => s.status === 'active').length;
  const featuredCount = stores.filter(s => s.isFeatured).length;

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Quản lý Cửa hàng</h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Bạn có tổng cộng <span className="font-bold text-slate-700">{stores.length}</span> cửa hàng trong hệ thống</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2 h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 font-bold text-sm">
          <Plus className="h-5 w-5" /> Thêm Cửa hàng
        </Button>
      </div>

      {/* Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Tổng cửa hàng', value: stores.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Store },
          { label: 'Đang hoạt động', value: activeCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Nổi bật', value: featuredCount, color: 'text-orange-600', bg: 'bg-orange-50', icon: Star },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-[28px] border border-slate-100 p-8 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", bg)}>
              <Icon className={cn("h-7 w-7", color)} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm tên hoặc slug..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="ml-auto px-5 py-2.5 bg-indigo-50 border border-indigo-100/50 rounded-2xl text-indigo-600 text-[11px] font-black uppercase tracking-widest">
            {filtered.length} cửa hàng
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">#</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[280px]">Cửa hàng / Thương hiệu</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Đường dẫn</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Ưu đãi</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Clicks</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Cập nhật</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right w-32 pr-8">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((store, idx) => {
                const id = (store.id || store._id)?.toString();
                const initial = (store.name || 'S').charAt(0).toUpperCase();
                const catName = categories.find((c: any) => (c.id || c._id)?.toString() === store.categoryId?.toString())?.name;
                const stats = id ? (dealStats[id] || { count: 0, clicks: 0 }) : { count: 0, clicks: 0 };
                const avatarColor = AVATAR_PALETTE[(store.name || 'S').charCodeAt(0) % AVATAR_PALETTE.length];
                const isActive = store.status === 'active';
                const editDate = store.updatedAt || store.createdAt;
                
                return (
                  <tr key={id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-bold text-slate-300 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {store.image ? (
                          <div className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden p-1 shrink-0 flex items-center justify-center">
                            <img src={store.image} alt="" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[16px] font-black shrink-0 shadow-sm", avatarColor)}>
                            {initial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[14px] font-extrabold text-slate-900 leading-tight truncate group-hover:text-indigo-600 transition-colors">{store.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{catName || 'General'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50 block truncate max-w-[140px]">
                        /{store.slug}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className="text-[14px] font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{stats.count}</span>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className="text-[14px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/50">{stats.clicks.toLocaleString()}</span>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleToggleStatus(store)}
                        disabled={togglingId === id}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                          isActive ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-100 border-slate-200"
                        )}
                      >
                        {togglingId === id ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-300")} />}
                        {isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-600">{editDate ? new Date(editDate).toLocaleDateString('vi-VN') : '—'}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Updated</span>
                      </div>
                    </td>

                    <td className="px-6 py-5 pr-8 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <a href={`/store/${store.slug}`} target="_blank" className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all" title="Xem trang">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button onClick={() => openModal(store)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all" title="Chỉnh sửa">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(id!)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
        <DialogContent size="xl" className="p-0 overflow-hidden border-none shadow-2xl rounded-[32px] max-h-[92vh]">
          <DialogHeader className="px-10 py-7 bg-slate-50/80 border-b border-slate-100">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">{editingStore ? 'Chỉnh sửa Cửa hàng' : 'Thêm Cửa hàng mới'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col overflow-hidden bg-white">
            <div className="overflow-y-auto px-10 py-10 space-y-10 max-h-[70vh]">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-fit mb-8 border border-slate-200/50">
                  <TabsTrigger value="general" className="rounded-xl px-8 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Chung</TabsTrigger>
                  <TabsTrigger value="content" className="rounded-xl px-8 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Review</TabsTrigger>
                  <TabsTrigger value="seo" className="rounded-xl px-8 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">SEO</TabsTrigger>
                  <TabsTrigger value="faqs" className="rounded-xl px-8 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">FAQs ({faqs.length})</TabsTrigger>
                </TabsList>

                {/* Tab: General */}
                <TabsContent value="general" className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[13px] font-black text-slate-700 ml-1">Tên Cửa hàng <span className="text-red-500">*</span></Label>
                      <Input name="name" value={editingStore?.name || ''} onChange={handleInputChange} required className="h-13 rounded-2xl border-slate-200 focus:ring-indigo-500/20 font-extrabold text-lg" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[13px] font-black text-slate-700 ml-1">Slug (đường dẫn)</Label>
                      <Input name="slug" value={editingStore?.slug || ''} onChange={handleInputChange} placeholder="vd: amazon-coupons" className="h-13 rounded-2xl border-slate-200 focus:ring-indigo-500/20 font-mono font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[13px] font-black text-slate-700 ml-1">Danh mục</Label>
                      <select name="categoryId" value={editingStore?.categoryId || ''} onChange={handleInputChange} className="w-full h-13 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer appearance-none">
                        <option value="">-- Chọn danh mục --</option>
                        {categories.filter(c => c.name).map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[13px] font-black text-slate-700 ml-1">Sự kiện (Events)</Label>
                      <select name="eventId" value={editingStore?.eventId || ''} onChange={handleInputChange} className="w-full h-13 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer appearance-none">
                        <option value="">-- Chọn sự kiện --</option>
                        {events.filter(e => e.name).map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[13px] font-black text-slate-700 ml-1">Link Affiliate <span className="text-red-500">*</span></Label>
                    <Input name="link" value={editingStore?.link || ''} onChange={handleInputChange} required className="h-13 rounded-2xl border-slate-200 focus:ring-indigo-500/20 font-medium text-blue-600 bg-blue-50/10" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUpload label="Logo (ảnh vuông)" value={image} onChange={setImage} />
                    <ImageUpload label="Banner (ảnh rộng)" value={banner} onChange={setBanner} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100">
                    <div className="space-y-3">
                      <Label className="text-[13px] font-black text-slate-700 ml-1">Đánh giá (1–5)</Label>
                      <Input type="number" name="rating" value={editingStore?.rating || 5} onChange={handleInputChange} min="1" max="5" step="0.1" className="h-13 rounded-2xl border-slate-200 font-black text-orange-600" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[13px] font-black text-slate-700 ml-1">Trạng thái hiện tại</Label>
                      <select name="status" value={editingStore?.status || 'active'} onChange={handleInputChange} className="w-full h-13 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer appearance-none">
                        <option value="active">Đang hoạt động (Active)</option>
                        <option value="inactive">Đang ẩn (Hidden)</option>
                      </select>
                    </div>
                    <div className="flex gap-10 col-span-full pt-4">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <Checkbox checked={isApproved} onCheckedChange={v => setIsApproved(!!v)} className="h-5 w-5 rounded-md" />
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Duyệt bài</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Publicly Approved</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <Checkbox checked={isFeatured} onCheckedChange={v => setIsFeatured(!!v)} className="h-5 w-5 rounded-md" />
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Nổi bật</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Featured Brand</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Content */}
                <TabsContent value="content" className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[13px] font-black text-slate-700 ml-1">Mô tả ngắn</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={handleGenerateShortDesc} disabled={generatingShortAI} className="h-9 px-4 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold gap-2">
                        {generatingShortAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {generatingShortAI ? 'AI đang viết...' : 'Viết bằng AI'}
                      </Button>
                    </div>
                    <Textarea name="description" value={editingStore?.description || ''} onChange={handleInputChange} rows={3} className="rounded-3xl border-slate-200 p-5 font-medium leading-relaxed" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[13px] font-black text-slate-700">Nội dung giới thiệu chi tiết (HTML)</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={handleGenerateStoreIntro} disabled={generatingAI} className="h-9 px-4 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold gap-2">
                        {generatingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {generatingAI ? 'AI đang viết...' : 'Viết bằng AI'}
                      </Button>
                    </div>
                    <Textarea name="content" value={editingStore?.content || ''} onChange={handleInputChange} rows={15} className="font-mono text-[12px] rounded-3xl border-slate-200 p-6 leading-relaxed bg-slate-50/30" />
                  </div>
                </TabsContent>

                {/* Tab: SEO */}
                <TabsContent value="seo" className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <Label className="text-[13px] font-black text-slate-700 ml-1">SEO Meta Title</Label>
                    <Input name="seoTitle" value={editingStore?.seoTitle || ''} onChange={handleInputChange} placeholder="Để trống sẽ dùng tiêu đề mặc định" className="h-13 rounded-2xl border-slate-200 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[13px] font-black text-slate-700 ml-1">SEO Meta Keywords</Label>
                    <Input name="seoKeywords" value={editingStore?.seoKeywords || ''} onChange={handleInputChange} placeholder="coupon, discount, promo code..." className="h-13 rounded-2xl border-slate-200 font-medium" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[13px] font-black text-slate-700 ml-1">SEO Meta Description</Label>
                    <Textarea name="seoDescription" value={editingStore?.seoDescription || ''} onChange={handleInputChange} rows={5} className="rounded-3xl border-slate-200 p-5 font-medium" />
                  </div>
                </TabsContent>

                {/* Tab: FAQs */}
                <TabsContent value="faqs" className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-5">
                    {faqs.map((faq, i) => (
                      <div key={i} className="group relative border border-slate-100 rounded-[28px] p-8 space-y-5 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl">Câu hỏi #{i + 1}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 rounded-xl font-bold">
                            Xóa bỏ
                          </Button>
                        </div>
                        <Input
                          placeholder="Câu hỏi cho khách hàng..."
                          value={faq.question}
                          onChange={e => { const n = [...faqs]; n[i].question = e.target.value; setFaqs(n); }}
                          className="h-12 rounded-xl border-slate-200 font-bold"
                        />
                        <Textarea
                          placeholder="Câu trả lời chi tiết..."
                          rows={2}
                          value={faq.answer}
                          onChange={e => { const n = [...faqs]; n[i].answer = e.target.value; setFaqs(n); }}
                          className="rounded-xl border-slate-200 font-medium"
                        />
                      </div>
                    ))}
                    <div className="flex gap-4 pt-4 px-2">
                      <Button type="button" variant="outline" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} className="h-13 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 gap-2">
                        <Plus className="h-4 w-4" /> Thêm câu hỏi
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-13 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2"
                        onClick={() => {
                          if (!editingStore?.name) return alert('Vui lòng nhập tên Cửa hàng trước!');
                          setFaqs(FAQ_TEMPLATES(editingStore.name));
                        }}
                      >
                        <Sparkles className="h-4 w-4" /> Tạo bộ FAQ mẫu
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="px-10 py-7 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={saving} className="h-13 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900">
                Đóng lại
              </Button>
              <Button type="submit" disabled={saving} className="h-13 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-[11px] uppercase tracking-widest gap-2 min-w-[180px]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                {editingStore ? 'Cập nhật ngay' : 'Tạo cửa hàng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
