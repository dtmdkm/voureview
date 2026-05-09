'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, Store, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

const slugify = (text: string) =>
  text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

export default function CategoriesClientPage({ initialCategories, initialStores }: { initialCategories: any[], initialStores: any[] }) {
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [stores, setStores] = useState<any[]>(initialStores);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    link: '',
    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [assigningStoreId, setAssigningStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultTab, setDefaultTab] = useState('basic');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = async (category: any = null, tab = 'basic') => {
    setDefaultTab(tab);
    setIsOpen(true);
    if (category) {
      setIsSaving(true);
      try {
        const id = category.id || category._id;
        const res = await fetch(`/api/categories/${id}`, { cache: 'no-store' });
        const full = await res.json();
        setEditingCategory(full);
        setFormData({
          name: full.name || '',
          slug: full.slug || '',
          icon: full.icon || '',
          link: full.link || '',
          seoTitle: full.seoTitle || '',
          seoKeywords: full.seoKeywords || '',
          seoDescription: full.seoDescription || '',
        });
      } catch (err) {
        alert('Không thể tải danh mục');
        setIsOpen(false);
      } finally {
        setIsSaving(false);
      }
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        icon: '',
        link: '',
        seoTitle: '',
        seoKeywords: '',
        seoDescription: '',
      });
    }
  };

  const refreshData = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const d = await res.json();
      if (Array.isArray(d)) setCategories(d);
      router.refresh();
    } catch (err) {
      console.error('Failed to refresh categories:', err);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    let slug = formData.slug || '';
    if (!slug || slug === '-') slug = slugify(formData.name);

    const body: any = { ...formData, slug };
    // Clean body
    delete body._id;
    delete body.id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;

    const url = editingCategory ? `/api/categories/${editingCategory.id || editingCategory._id}` : '/api/categories';
    
    try {
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setIsOpen(false);
        await refreshData();
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể lưu'));
      }
    } catch (err) {
      alert('Lỗi kết nối mạng');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa danh mục này?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    setCategories(categories.filter(c => (c.id || c._id) !== id));
    router.refresh();
  };

  const handleAssignStore = async (storeId: string, assign: boolean) => {
    setAssigningStoreId(storeId);
    const targetCategoryId = assign ? (editingCategory.id || editingCategory._id) : null;
    setStores(prev => prev.map(s => (s.id || s._id) === storeId ? { ...s, categoryId: targetCategoryId } : s));
    const res = await fetch(`/api/stores/${storeId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: targetCategoryId }) });
    if (!res.ok) alert('Lỗi cập nhật Store');
    setAssigningStoreId(null);
  };

  const filtered = categories.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Quản lý Danh mục</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Bạn có tổng cộng {categories.length} danh mục trong hệ thống</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2 h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95">
          <Plus className="h-4 w-4" /> Thêm Danh mục
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Tìm nhanh danh mục..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-100 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-16">Icon</th>
              <th className="min-w-[200px]">Tên danh mục</th>
              <th>Đường dẫn (Slug)</th>
              <th className="text-right w-48">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cat => (
              <tr key={cat.id || cat._id} className="group">
                <td><div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shadow-sm">{cat.icon || '📁'}</div></td>
                <td className="px-4 py-4 font-bold text-slate-900 text-sm">{cat.name}</td>
                <td className="px-4 py-4 text-[11px] text-slate-400 font-medium">/{cat.slug || '—'}</td>
                <td className="px-4 py-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => openModal(cat, 'stores')} className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                      <Store className="h-3.5 w-3.5" /> Stores
                    </button>
                    <button onClick={() => openModal(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(cat.id || cat._id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="py-24 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100"><FolderOpen className="h-8 w-8 text-slate-300" /></div>
                <p className="text-[15px] font-bold text-slate-700">Không tìm thấy danh mục nào</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="md" className="max-h-[90vh]">
          <DialogHeader><DialogTitle>{editingCategory ? 'Chỉnh sửa Category' : 'Thêm Category mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col min-h-0 flex-1">
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue={defaultTab} key={defaultTab} className="px-6 pt-2">
                <TabsList>
                  <TabsTrigger value="basic">Thông tin chung</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  {editingCategory && <TabsTrigger value="stores">Stores</TabsTrigger>}
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pb-4">
                  <div className="space-y-1.5"><Label>Tên danh mục <span className="text-red-500">*</span></Label><Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="VD: Thời trang & Phụ kiện" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Slug</Label><Input name="slug" value={formData.slug} onChange={handleInputChange} placeholder="Tự động tạo nếu để trống" /></div>
                    <div className="space-y-1.5"><Label>Icon (Emoji)</Label><Input name="icon" value={formData.icon} onChange={handleInputChange} placeholder="VD: 👗" /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Link gốc (nếu có)</Label><Input name="link" value={formData.link} onChange={handleInputChange} placeholder="https://..." /></div>
                </TabsContent>
                <TabsContent value="seo" className="space-y-4 pb-4">
                  <div className="space-y-1.5"><Label>SEO Meta Title</Label><Input name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} placeholder="Tiêu đề Google" /></div>
                  <div className="space-y-1.5"><Label>SEO Meta Keywords</Label><Input name="seoKeywords" value={formData.seoKeywords} onChange={handleInputChange} placeholder="từ khóa 1, từ khóa 2..." /></div>
                  <div className="space-y-1.5"><Label>SEO Meta Description</Label><Textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={4} placeholder="Mô tả ngắn cho Google" /></div>
                </TabsContent>
                {editingCategory && (
                  <TabsContent value="stores" className="pb-4">
                    <p className="text-[13px] font-medium text-slate-500 mb-4 px-1">Chọn các Cửa hàng thuộc danh mục <strong>{editingCategory?.name}</strong></p>
                    <div className={cn("admin-table-container bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden max-h-[400px] overflow-y-auto bg-slate-50/30")}>
                      {stores.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400 font-medium">Không có Store nào trong hệ thống.</div>
                      ) : stores.map(store => {
                        const storeId = store.id || store._id;
                        const isAssigned = store.categoryId === (editingCategory?.id || editingCategory?._id);
                        const isLoading = assigningStoreId === storeId;
                        const otherCat = !isAssigned && store.categoryId ? categories.find(c => (c.id || c._id) === store.categoryId) : null;
                        return (
                          <div key={storeId} className="flex items-center justify-between px-4 py-3 hover:bg-white transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                              {store.image ? (
                                <img src={store.image} className="w-8 h-8 rounded-lg object-contain border border-slate-100 bg-white shadow-sm shrink-0" alt="" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 uppercase">{(store.name || 'S').substring(0, 1)}</div>
                              )}
                              <div className="min-w-0">
                                <div className="text-[13px] font-bold text-slate-900 truncate">{store.name}</div>
                                {otherCat && <div className="text-[10px] font-bold text-amber-500 uppercase tracking-tight mt-0.5">Thuộc: {otherCat.name}</div>}
                              </div>
                            </div>
                            <div className="shrink-0 ml-4">
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                                : <Checkbox checked={isAssigned} onCheckedChange={v => handleAssignStore(storeId, !!v)} className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Hủy</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingCategory ? 'Lưu thay đổi' : 'Thêm Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
