'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, Copy, CheckCircle, Image as ImageIcon, History, Link as LinkIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ImageUpload';
import { cn } from '@/lib/utils';

export default function AdminUpload() {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleUploaded = (uploadedUrl: string) => {
    setUrl(uploadedUrl);
    setHistory(h => {
      // Don't add duplicate if it's already the most recent
      if (h[0] === uploadedUrl) return h;
      return [uploadedUrl, ...h.slice(0, 19)];
    });
  };

  const handleCopy = (src: string) => {
    navigator.clipboard.writeText(src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Quản lý Tệp tải lên</h1>
          <p className="text-sm text-slate-500 font-medium">Tải ảnh lên hệ thống và lấy liên kết trực tiếp để nhúng vào bài viết hoặc sản phẩm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 lg:p-10 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <UploadCloud className="h-5 w-5 text-indigo-600" />
             </div>
             <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Khu vực tải lên</h3>
          </div>
          
          <div className="flex-1 flex flex-col space-y-6">
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex-1">
              <ImageUpload label="" value={url} onChange={handleUploaded} />
            </div>

            {url && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Liên kết hình ảnh (URL)</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                     <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input
                       readOnly
                       value={url}
                       className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-mono text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                     />
                  </div>
                  <Button 
                    onClick={() => handleCopy(url)}
                    className={cn(
                       "h-11 px-5 rounded-xl font-bold transition-all shrink-0",
                       copied 
                         ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 shadow-none" 
                         : "bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-200 active:scale-95"
                    )}
                  >
                    {copied ? <><CheckCircle className="h-4 w-4 mr-2" /> Đã sao chép</> : <><Copy className="h-4 w-4 mr-2" /> Sao chép</>}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
               <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
               <p className="text-[12px] text-indigo-700 font-medium leading-relaxed">
                 Hệ thống tự động tối ưu hóa hình ảnh. URL được tạo ra có thể dán trực tiếp vào trình soạn thảo HTML của bài viết hoặc sử dụng làm ảnh đại diện cho Deals.
               </p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <History className="h-5 w-5 text-slate-500" />
               </div>
               <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Phiên tải lên gần đây</h3>
            </div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
               {history.length} tệp
            </div>
          </div>
          
          <div className="flex-1">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-40">
                 <ImageIcon className="w-12 h-12 mb-4" />
                 <p className="font-bold text-[14px]">Chưa có tệp nào</p>
                 <p className="text-[12px] font-medium mt-1">Các ảnh tải lên trong phiên làm việc này sẽ hiển thị ở đây.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 admin-main-scroll">
                {history.map((src, i) => (
                  <div 
                    key={`${src}-${i}`} 
                    className="relative group cursor-pointer aspect-square rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-400 hover:shadow-md transition-all" 
                    onClick={() => handleCopy(src)} 
                    title="Click để copy link trực tiếp"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Uploaded preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-900 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                         <Copy className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Copy URL</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
