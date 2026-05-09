'use client';

import { useState } from 'react';
import { Save, Plus, X, Loader2, BookOpen, Building2, Scale, Globe, Mail, Image as ImageIcon, Layout, Settings, Sparkles, Check } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const FOOTER_SECTIONS = [
  { key: 'footer_resources', label: 'Resources (Col 1)', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'footer_company', label: 'Company (Col 2)', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'footer_notices', label: 'Legal (Col 3)', icon: Scale, color: 'text-slate-600', bg: 'bg-slate-50' },
];

const DEFAULT_BANNERS = [
  { title: 'Save Big and Slay', desc: 'Get 15% off', bg: '#001d5e', image: '', link: '/deals', isActive: true },
  { title: 'Enjoy your Vacations', desc: 'Get 25% off', bg: '#FF575B', image: '', link: '/deals', isActive: true },
  { title: 'Take care of your furbabies', desc: 'Get 10% Cash Back', bg: '#001340', image: '', link: '/deals', isActive: true },
];

export default function SettingsClientPage({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState<any>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const key in settings) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: settings[key] }),
        });
      }
      alert('Cập nhật cấu hình thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu cấu hình.');
    } finally { setSaving(false); }
  };

  const set = (k: string, v: any) => setSettings((s: any) => ({ ...s, [k]: v }));
  const addLink = (section: string) => set(section, [...(settings[section] || []), { name: 'New Link', link: '#' }]);
  const updateLink = (section: string, i: number, field: string, v: string) => {
    const arr = [...(settings[section] || [])];
    arr[i] = { ...arr[i], [field]: v };
    set(section, arr);
  };
  const removeLink = (section: string, i: number) =>
    set(section, (settings[section] || []).filter((_: any, idx: number) => idx !== i));

  // Banner helpers
  const addBanner = () => set('home_banners', [...(settings.home_banners || DEFAULT_BANNERS), { title: 'New Banner', desc: 'Description', bg: '#001d5e', image: '', link: '/deals', isActive: true }]);
  const updateBanner = (i: number, field: string, v: any) => {
    const arr = [...(settings.home_banners || DEFAULT_BANNERS)];
    arr[i] = { ...arr[i], [field]: v };
    set('home_banners', arr);
  };
  const removeBanner = (i: number) =>
    set('home_banners', (settings.home_banners || DEFAULT_BANNERS).filter((_: any, idx: number) => idx !== i));

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Website Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Customize branding and homepage layout</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}
          className="gap-2 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 font-bold active:scale-95">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </Button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <Tabs defaultValue="general" className="w-full">
          <div className="px-8 border-b border-slate-100 bg-slate-50/50">
            <TabsList className="bg-transparent h-16 gap-8">
              {[
                { id: 'general', label: 'General' },
                { id: 'homepage', label: 'Homepage Banners' },
                { id: 'footer', label: 'Footer Links' },
                { id: 'advanced', label: 'Advanced' }
              ].map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#eb004a] data-[state=active]:border-b-2 data-[state=active]:border-[#eb004a] rounded-none h-16 px-0 text-[14px] font-bold text-slate-500 transition-all">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-8 lg:p-10">
            <TabsContent value="general" className="m-0 space-y-10 animate-in fade-in-50 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-[#eb004a]" />
                    <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Basic Information</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Website Title (SEO)</Label>
                      <Input value={settings.site_title || ''} onChange={e => set('site_title', e.target.value)} placeholder="e.g. Voureview - Coupons & Deals" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Contact Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input type="email" value={settings.contact_email || ''} onChange={e => set('contact_email', e.target.value)} placeholder="contact@domain.com" className="h-11 pl-11 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-5 w-5 text-[#eb004a]" />
                    <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Branding</h3>
                  </div>
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <ImageUpload label="Main Website Logo" value={settings.site_logo || ''} onChange={url => set('site_logo', url)} />
                    <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />Đề xuất: Ảnh PNG tách nền, kích thước tối ưu 200x60px.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="homepage" className="m-0 animate-in fade-in-50 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#eb004a]" />
                  <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Homepage Hero Banners</h3>
                </div>
                <Button variant="outline" onClick={addBanner} className="gap-2 rounded-xl font-bold">
                  <Plus className="h-4 w-4" /> Add New Banner
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {(settings.home_banners || DEFAULT_BANNERS).map((banner: any, i: number) => (
                  <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-8 relative group hover:border-[#eb004a]/30 transition-all">
                    <button 
                      onClick={() => removeBanner(i)}
                      className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Preview Column */}
                      <div className="lg:col-span-4 space-y-4">
                        <Label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Preview</Label>
                        <div 
                          className={cn(
                            "aspect-[16/9] rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center overflow-hidden shadow-inner relative transition-opacity",
                            !banner.isActive && "opacity-40 grayscale"
                          )}
                          style={{ backgroundColor: banner.bg }}
                        >
                          {!banner.isActive && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                              <span className="bg-white text-slate-900 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl">Disabled</span>
                            </div>
                          )}
                          {banner.image && (
                            <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          )}
                          <div className="relative z-10 text-lg font-bold leading-tight mb-2 drop-shadow-md">{banner.title || 'No Title'}</div>
                          <div className="relative z-10 inline-block px-4 py-1.5 bg-white text-slate-900 rounded-full text-[10px] font-extrabold shadow-sm">
                            {banner.desc || 'No Button Text'}
                          </div>
                        </div>
                      </div>

                      {/* Fields Column */}
                      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 mb-2">
                          <ImageUpload label="Banner Background Image (Optional)" value={banner.image || ''} onChange={url => updateBanner(i, 'image', url)} />
                          <p className="text-[11px] text-slate-400 mt-2">Recommended: 1920x600px. If an image is uploaded, it will replace the solid color.</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Banner Title</Label>
                          <Input value={banner.title} onChange={e => updateBanner(i, 'title', e.target.value)} placeholder="e.g. Save Big and Slay" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Button Text / Offer</Label>
                          <Input value={banner.desc} onChange={e => updateBanner(i, 'desc', e.target.value)} placeholder="e.g. Get 15% off" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Background Color (Hex)</Label>
                          <div className="flex gap-2">
                            <div className="w-11 h-11 rounded-xl border border-slate-200" style={{ backgroundColor: banner.bg }} />
                            <Input value={banner.bg} onChange={e => updateBanner(i, 'bg', e.target.value)} placeholder="#001d5e" className="h-11 rounded-xl font-mono uppercase flex-1" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Target Link URL</Label>
                          <Input value={banner.link} onChange={e => updateBanner(i, 'link', e.target.value)} placeholder="/deals" className="h-11 rounded-xl" />
                        </div>
                        <div className="md:col-span-2 pt-2">
                          <div 
                            onClick={() => updateBanner(i, 'isActive', !banner.isActive)}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer select-none",
                              banner.isActive ? "bg-green-50/50 border-green-100 text-green-700" : "bg-slate-50 border-slate-200 text-slate-400"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                              banner.isActive ? "bg-green-600 text-white" : "bg-slate-200 text-slate-400"
                            )}>
                              {banner.isActive && <Check className="h-4 w-4 stroke-[3]" />}
                            </div>
                            <span className="font-bold text-[14px]">Enable this banner on Homepage</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="footer" className="m-0 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-2 mb-8">
                <Layout className="h-5 w-5 text-[#eb004a]" />
                <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Footer Layout</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {FOOTER_SECTIONS.map(({ key, label, icon: Icon, color, bg }) => (
                  <div key={key} className="bg-slate-50/30 border border-slate-100 rounded-[24px] p-6 space-y-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}><Icon className={cn("h-5 w-5", color)} /></div>
                      <span className="font-bold text-slate-900 text-[14px] tracking-tight">{label}</span>
                    </div>
                    <div className="space-y-2.5">
                      {(settings[key] || []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex-1 space-y-1">
                            <input className="w-full text-[12px] font-bold text-slate-900 bg-transparent focus:outline-none px-2" value={item.name} onChange={e => updateLink(key, i, 'name', e.target.value)} placeholder="Tên nhãn" />
                            <input className="w-full text-[11px] font-medium text-slate-400 bg-transparent focus:outline-none px-2" value={item.link} onChange={e => updateLink(key, i, 'link', e.target.value)} placeholder="URL" />
                          </div>
                          <button type="button" className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => removeLink(key, i)}><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" onClick={() => addLink(key)} className="w-full h-10 rounded-xl border-dashed border-slate-200 text-slate-500 text-[13px] font-bold hover:bg-white transition-all hover:border-indigo-300 hover:text-indigo-600">
                      <Plus className="h-4 w-4 mr-1.5" /> Thêm liên kết mới
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="m-0 space-y-10 animate-in fade-in-50 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* OpenAI Section */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                      <Sparkles className="h-5 w-5 text-[#eb004a]" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight">OpenAI Configuration</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Powering the AI Writer & SEO tools</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">OpenAI API Key</Label>
                      <Input 
                        type="password"
                        value={settings.openai_api_key || ''} 
                        onChange={e => set('openai_api_key', e.target.value)} 
                        placeholder="sk-..." 
                        className="h-11 rounded-xl bg-white border-slate-200" 
                      />
                      <p className="text-[10px] text-slate-400 font-medium px-1">Mã khóa được bảo mật và không bao giờ hiển thị ngoài Admin.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Model Name</Label>
                      <Input 
                        value={settings.openai_model || ''} 
                        onChange={e => set('openai_model', e.target.value)} 
                        placeholder="gpt-4o-mini" 
                        className="h-11 rounded-xl bg-white border-slate-200" 
                      />
                    </div>
                  </div>
                </div>

                {/* Gemini Section */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                      <Globe className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight">Google Gemini Configuration</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Alternative high-speed AI engine</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Gemini API Key</Label>
                      <Input 
                        type="password"
                        value={settings.gemini_api_key || ''} 
                        onChange={e => set('gemini_api_key', e.target.value)} 
                        placeholder="Mã API từ Google AI Studio" 
                        className="h-11 rounded-xl bg-white border-slate-200" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Model Name</Label>
                      <Input 
                        value={settings.gemini_model || ''} 
                        onChange={e => set('gemini_model', e.target.value)} 
                        placeholder="gemini-1.5-flash" 
                        className="h-11 rounded-xl bg-white border-slate-200" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
