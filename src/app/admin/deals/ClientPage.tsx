'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, Tag, TrendingUp, CheckCircle, ChevronRight } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const EMPTY_FORM = {
  title: '', storeId: '', price: '', discountPrice: '', discountValue: '',
  link: '', description: '', image: '', type: 'deal', code: '',
  expiryDate: '', isVerified: true, isApproved: true, sortOrder: 99999,
};

interface ClientPageProps {
  initialDeals: any[];
  initialStores: any[];
}

export default function ClientPage({ initialDeals, initialStores }: ClientPageProps) {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>(initialDeals);
  const [stores] = useState<any[]>(initialStores);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM, seoTitle: '', seoKeywords: '', seoDescription: '' });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, storeFilter, typeFilter]);

  const refreshData = async () => {
    const res = await fetch('/api/deals', { cache: 'no-store' });
    const d = await res.json();
    if (Array.isArray(d)) setDeals(d);
  };

  const openNew = () => { 
    setEditingDeal(null); 
    setFormData({ ...EMPTY_FORM, seoTitle: '', seoKeywords: '', seoDescription: '' }); 
    setActiveTab('basic');
    setIsOpen(true); 
  };

  const handleEdit = async (deal: any) => {
    setActiveTab('basic');
    setIsOpen(true);
    setSaving(true); // Re-use saving state for loading detail
    try {
      const id = deal.id || deal._id;
      const res = await fetch(`/api/deals/${id}`, { cache: 'no-store' });
      const fullDeal = await res.json();
      setEditingDeal(fullDeal);
      setFormData({ 
        ...EMPTY_FORM, 
        ...fullDeal, 
        storeId: fullDeal.storeId?.id || fullDeal.storeId?._id || fullDeal.storeId || '', 
        isApproved: fullDeal.isApproved !== false, 
        isVerified: fullDeal.isVerified !== false,
        seoTitle: fullDeal.seoTitle || '',
        seoKeywords: fullDeal.seoKeywords || '',
        seoDescription: fullDeal.seoDescription || '',
      });
    } catch (err) {
      alert('Không thể tải thông tin chi tiết');
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: any = { ...formData };
    // Clean body: remove internal fields that Mongoose might reject
    delete body._id;
    delete body.id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;
    
    if (!body.storeId) delete body.storeId;
    
    const id = editingDeal?.id || editingDeal?._id;
    const url = editingDeal ? `/api/deals/${id}` : '/api/deals';
    
    try {
      const res = await fetch(url, { 
        method: editingDeal ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      if (res.ok) {
        const saved = await res.json();
        setIsOpen(false);
        if (editingDeal) {
          setDeals(prev => prev.map(d => (d.id || d._id) === (saved.id || saved._id) ? { ...d, ...saved } : d));
        } else {
          setDeals(prev => [{ ...saved, storeId: stores.find(s => (s.id || s._id) === body.storeId) || body.storeId }, ...prev]);
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
    if (!confirm('Xóa ưu đãi này?')) return;
    setDeals(prev => prev.filter(d => (d.id || d._id) !== id));
    try {
      const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
      if (!res.ok) refreshData();
    } catch (err) {
      alert('Lỗi khi xóa');
      refreshData();
    }
  };

  const setField = (k: string, v: any) => setFormData(f => ({ ...f, [k]: v }));

  const filtered = deals.filter(d => {
    const matchSearch = !searchQuery || 
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const storeIdVal = d.storeId?.id || d.storeId?._id || d.storeId;
    const matchStore = !storeFilter || storeIdVal === storeFilter;
    const matchType = !typeFilter || d.type === typeFilter;
    return matchSearch && matchStore && matchType;
  });

  const totalClicks = deals.reduce((s, d) => s + (d.clicks || 0), 0);
  const couponCount = deals.filter(d => d.type === 'code').length;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStore = (deal: any) => {
    const sid = deal.storeId?.id || deal.storeId?._id || deal.storeId;
    return stores.find(s => (s.id || s._id) === sid);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Quản lý Ưu đãi (Deals)
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Bạn có tổng cộng {deals.length} ưu đãi trong hệ thống</p>
        </div>
        <Button onClick={openNew} className="gap-2 h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 text-sm font-bold">
          <Plus className="h-5 w-5" /> Thêm Ưu đãi
        </Button>
      </div>

      {/* Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Tổng deals', value: deals.length, icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Coupon codes', value: couponCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tổng clicks', value: totalClicks.toLocaleString(), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-[28px] border border-slate-100 p-8 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-sm`}><Icon className={`h-7 w-7 ${color}`} /></div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm nhanh tên hoặc mã coupon..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-100 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={storeFilter}
              onChange={e => setStoreFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-100 bg-slate-50 px-5 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all min-w-[180px] cursor-pointer"
            >
              <option value="">Tất cả Store</option>
              {stores.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-100 bg-slate-50 px-5 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all min-w-[140px] cursor-pointer"
            >
              <option value="">Tất cả loại</option>
              <option value="code">Coupon Code</option>
              <option value="deal">Deal</option>
            </select>
          </div>
          {(searchQuery || storeFilter || typeFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setStoreFilter(''); setTypeFilter(''); }}
              className="h-12 px-5 rounded-2xl border border-slate-200 text-xs font-black text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all uppercase tracking-widest"
            >
              Xóa bộ lọc
            </button>
          )}
          <div className="ml-auto px-5 py-2 bg-indigo-50 border border-indigo-100/50 rounded-2xl text-indigo-600 text-[11px] font-black uppercase tracking-widest">
            {filtered.length} kết quả
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-bottom border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">#</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[320px]">Ưu đãi / Coupon</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-44">Cửa hàng</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Loại</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Giảm giá</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Clicks</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right w-32 pr-8">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((deal, idx) => {
                const store = getStore(deal);
                const initial = (store?.name || 'S').substring(0, 2).toUpperCase();
                return (
                  <tr key={deal.id || deal._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-bold text-slate-300 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {deal.image ? (
                          <div className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center p-1">
                            <img src={deal.image} className="w-full h-full object-contain" alt="" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 text-xs shrink-0 font-black border border-slate-100 shadow-inner">
                            {deal.type === 'code' ? '%' : '→'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 text-[14px] leading-snug group-hover:text-indigo-600 transition-colors">{deal.title}</div>
                          {deal.code ? (
                            <div className="mt-1.5 inline-flex items-center text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-indigo-100/50">
                              {deal.code}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">Direct Deal</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {store?.image ? (
                          <div className="w-8 h-8 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden shrink-0 p-0.5">
                            <img src={store.image} className="w-full h-full object-contain" alt="" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black shrink-0 border border-slate-200/50">{initial}</div>
                        )}
                        <span className="text-[13px] font-bold text-slate-600 truncate max-w-[120px]">{store?.name || '—'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      {deal.type === 'code' ? (
                        <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-violet-100">COUPON</span>
                      ) : (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">DEAL</span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      {deal.discountValue || deal.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-indigo-600">{deal.discountValue || deal.discountPrice}</span>
                          {deal.price && <span className="text-[11px] text-slate-400 font-bold line-through">Giá: {deal.price}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 font-bold">—</span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <TrendingUp className="h-3 w-3 text-slate-400" />
                        {(deal.clicks || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                        deal.isApproved !== false 
                          ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                          : "text-slate-400 bg-slate-100 border-slate-200"
                      )}>
                        {deal.isApproved !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>

                    <td className="px-6 py-5 pr-8 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => handleEdit(deal)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-sm transition-all border border-transparent hover:border-indigo-100"
                        >
                          <Pencil className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id || deal._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-sm transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
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
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-inner">
              <Tag className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-[18px] font-black text-slate-800">Không tìm thấy ưu đãi nào</p>
            <p className="text-[14px] text-slate-500 mt-2 font-medium">Vui lòng thử thay đổi bộ lọc hoặc thêm mới.</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="lg" className="p-0 overflow-hidden border-none shadow-2xl rounded-[28px]">
          <DialogHeader className="px-8 py-6 bg-slate-50/80 border-b border-slate-100">
            <DialogTitle className="text-xl font-black text-slate-900">{editingDeal ? 'Chỉnh sửa Ưu đãi' : 'Tạo Ưu đãi mới'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col overflow-hidden bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-8 border-b border-slate-100 bg-slate-50/30">
                <TabsList className="h-12 bg-transparent gap-8">
                  <TabsTrigger value="basic" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent bg-transparent text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all px-1">Thông tin cơ bản</TabsTrigger>
                  <TabsTrigger value="details" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent bg-transparent text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all px-1">Chi tiết & Media</TabsTrigger>
                  <TabsTrigger value="seo" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent bg-transparent text-sm font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all px-1">SEO Metadata</TabsTrigger>
                </TabsList>
              </div>

              <div className="overflow-y-auto px-8 py-8 max-h-[60vh]">
                <TabsContent value="basic" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Tên tiêu đề ưu đãi <span className="text-red-500">*</span></Label>
                      <Input 
                        value={formData.title} 
                        onChange={e => setField('title', e.target.value)} 
                        placeholder="VD: Extra $10 OFF for New Customers" 
                        required 
                        className="h-12 rounded-2xl border-slate-200 focus:ring-indigo-500/20 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Loại ưu đãi</Label>
                        <select 
                          value={formData.type} 
                          onChange={e => setField('type', e.target.value)} 
                          className="flex w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer appearance-none"
                        >
                          <option value="code">Coupon Code</option>
                          <option value="deal">Deal (link trực tiếp)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Giá trị giảm</Label>
                        <Input 
                          value={formData.discountValue} 
                          onChange={e => setField('discountValue', e.target.value)} 
                          placeholder="VD: 20% OFF" 
                          className="h-12 rounded-2xl border-slate-200 font-bold text-indigo-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Mã Coupon</Label>
                        <Input 
                          value={formData.code} 
                          onChange={e => setField('code', e.target.value)} 
                          placeholder="VD: SAVE20" 
                          className="h-12 rounded-2xl border-slate-200 font-mono font-black uppercase text-indigo-600 bg-indigo-50/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Chọn Cửa hàng <span className="text-red-500">*</span></Label>
                        <select 
                          value={formData.storeId} 
                          onChange={e => setField('storeId', e.target.value)} 
                          required 
                          className="flex w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer appearance-none"
                        >
                          <option value="">— Chọn Store —</option>
                          {stores.filter(s => s.name).map(s => (
                            <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 ml-1">Hạn dùng (Expiry)</Label>
                        <Input 
                          value={formData.expiryDate} 
                          onChange={e => setField('expiryDate', e.target.value)} 
                          placeholder="VD: 31/12/2025" 
                          className="h-12 rounded-2xl border-slate-200 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Affiliate Link <span className="text-red-500">*</span></Label>
                      <Input 
                        value={formData.link} 
                        onChange={e => setField('link', e.target.value)} 
                        placeholder="https://..." 
                        required 
                        className="h-12 rounded-2xl border-slate-200 text-sm font-medium text-blue-600 bg-blue-50/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Chi tiết ưu đãi</Label>
                      <Textarea 
                        value={formData.description} 
                        onChange={e => setField('description', e.target.value)} 
                        rows={4} 
                        placeholder="Viết vài dòng giới thiệu về ưu đãi này..." 
                        className="rounded-[20px] border-slate-200 p-4 focus:ring-indigo-500/20 font-medium leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <ImageUpload label="Ảnh Deal (không bắt buộc)" value={formData.image} onChange={url => setField('image', url)} />
                      <div className="space-y-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Thứ tự ưu tiên</Label>
                          <Input 
                            type="number" 
                            value={formData.sortOrder} 
                            onChange={e => setField('sortOrder', parseInt(e.target.value) || 99999)} 
                            className="h-12 rounded-2xl border-slate-200 font-bold"
                          />
                        </div>
                        
                        <div className="space-y-4 pt-2">
                          <label className="flex items-center gap-4 cursor-pointer group p-2 rounded-xl hover:bg-white transition-colors">
                            <div className="relative flex items-center justify-center">
                              <Checkbox checked={formData.isVerified} onCheckedChange={v => setField('isVerified', !!v)} className="h-5 w-5 rounded-md border-2" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Đã xác minh</span>
                              <span className="text-[11px] text-slate-400 font-bold">Hiện tick xanh Verified</span>
                            </div>
                          </label>
                          
                          <label className="flex items-center gap-4 cursor-pointer group p-2 rounded-xl hover:bg-white transition-colors">
                            <div className="relative flex items-center justify-center">
                              <Checkbox checked={formData.isApproved} onCheckedChange={v => setField('isApproved', !!v)} className="h-5 w-5 rounded-md border-2" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Công khai</span>
                              <span className="text-[11px] text-slate-400 font-bold">Hiển thị cho người dùng</span>
                            </div>
                          </label>
                        </div>
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
                        onChange={e => setField('seoTitle', e.target.value)} 
                        placeholder="Tiêu đề hiển thị trên Google..." 
                        className="h-12 rounded-2xl border-slate-200 font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">SEO Keywords</Label>
                      <Input 
                        value={formData.seoKeywords} 
                        onChange={e => setField('seoKeywords', e.target.value)} 
                        placeholder="VD: coupon, discount, promo code..." 
                        className="h-12 rounded-2xl border-slate-200 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">SEO Meta Description</Label>
                      <Textarea 
                        value={formData.seoDescription} 
                        onChange={e => setField('seoDescription', e.target.value)} 
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
                  {editingDeal ? 'Lưu thay đổi' : 'Tạo ngay'}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
