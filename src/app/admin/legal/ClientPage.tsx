'use client';

import { useState } from 'react';
import { Save, Loader2, Shield, Scale, HelpCircle, Info, ExternalLink, FileText, Code2, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const PAGES = [
  { key: 'page_about', label: 'Về chúng tôi', placeholder: 'Nội dung trang About Us...', icon: Info },
  { key: 'page_contact', label: 'Liên hệ', placeholder: 'Nội dung trang Contact...', icon: HelpCircle },
  { key: 'page_privacy', label: 'Chính sách bảo mật', placeholder: 'Nội dung Privacy Policy...', icon: Shield },
  { key: 'page_terms', label: 'Điều khoản sử dụng', placeholder: 'Nội dung Terms of Use...', icon: Scale },
  { key: 'page_affiliate', label: 'Affiliate Disclosure', placeholder: 'Nội dung Affiliate Disclosure...', icon: ExternalLink },
  { key: 'page_cookie', label: 'Cookie Policy', placeholder: 'Nội dung Cookie Policy...', icon: FileText },
];

export default function LegalClientPage({ initialContents }: { initialContents: Record<string, string> }) {
  const [contents, setContents] = useState<Record<string, string>>(initialContents);
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await fetch('/api/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: contents[key] || '' }),
      });
    } finally { setSaving(null); }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Nội dung trang tĩnh</h1>
        <p className="text-sm text-slate-500 font-medium">Quản lý nội dung văn bản cho các trang chính sách và thông tin hệ thống</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
        <Tabs defaultValue="page_about" className="flex-1 flex flex-col">
          <div className="px-8 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
            <TabsList className="bg-transparent h-16 gap-6 inline-flex min-w-max">
              {PAGES.map(p => (
                <TabsTrigger key={p.key} value={p.key}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-16 px-2 text-[13px] font-bold text-slate-500 transition-all flex items-center gap-2">
                  <p.icon className="h-3.5 w-3.5" />{p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-8 lg:p-10 flex-1 flex flex-col">
            {PAGES.map(p => (
              <TabsContent key={p.key} value={p.key} className="m-0 space-y-6 flex-1 flex flex-col animate-in fade-in-50 duration-500">
                <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                      <Code2 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-900">{p.label}</p>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                        URL: <span className="text-indigo-500 font-mono">/{p.key.replace('page_', '')}</span>
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleSave(p.key)} disabled={saving === p.key}
                    className="gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold active:scale-95">
                    {saving === p.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu nội dung
                  </Button>
                </div>
                <Textarea
                  placeholder={p.placeholder}
                  value={contents[p.key] || ''}
                  onChange={e => setContents(c => ({ ...c, [p.key]: e.target.value }))}
                  className="flex-1 min-h-[500px] font-mono text-[13px] leading-relaxed p-6 rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none bg-slate-50/20"
                />
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                    <strong className="font-bold">Lưu ý:</strong> Hỗ trợ định dạng HTML — sử dụng các thẻ <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code> để định dạng nội dung.
                  </p>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
