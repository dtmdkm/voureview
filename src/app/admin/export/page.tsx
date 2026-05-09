'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EXPORTS = [
  { type: 'stores', label: 'Cửa hàng (Stores)', desc: 'Toàn bộ danh sách cửa hàng, bao gồm slug, link, SEO, FAQ', icon: '🏪' },
  { type: 'deals', label: 'Mã giảm giá (Deals)', desc: 'Tất cả deals/coupons kèm thông tin store liên kết', icon: '🏷️' },
  { type: 'categories', label: 'Danh mục (Categories)', desc: 'Danh sách tất cả danh mục sản phẩm', icon: '📂' },
  { type: 'blog', label: 'Bài viết (Blog)', desc: 'Toàn bộ bài viết blog đã đăng và nháp', icon: '📝' },
];

export default function AdminExport() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setDownloading(type);
    setDone(null);
    try {
      const res = await fetch(`/api/export?type=${type}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(type);
      setTimeout(() => setDone(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Xuất dữ liệu</h1>
        <p className="text-sm text-gray-500 mt-1">Tải xuống toàn bộ dữ liệu dưới dạng JSON để backup hoặc migrate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORTS.map(({ type, label, desc, icon }) => (
          <Card key={type}>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
              <Button
                variant={done === type ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleExport(type)}
                disabled={downloading === type}
                className="shrink-0"
              >
                {downloading === type ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : done === type ? (
                  <><CheckCircle className="h-4 w-4 text-green-500" />Xong</>
                ) : (
                  <><Download className="h-4 w-4" />Tải xuống</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Lưu ý</h3>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
            <li>Dữ liệu xuất ra định dạng JSON, phù hợp để backup hoặc import vào hệ thống khác.</li>
            <li>File sẽ được tải ngay về máy của bạn sau khi nhấn nút.</li>
            <li>Dữ liệu bao gồm tất cả records, kể cả đã ẩn.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
