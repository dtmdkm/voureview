'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const compressImage = (file: File): Promise<File> =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let { width, height } = img;
          const MAX = 1920;
          if (width > height ? width > MAX : height > MAX) {
            if (width > height) { height *= MAX / width; width = MAX; }
            else { width *= MAX / height; height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, width, height); }
          canvas.toBlob(blob => {
            resolve(blob
              ? new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', { type: 'image/webp', lastModified: Date.now() })
              : file
            );
          }, 'image/webp', 0.8);
        };
      };
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const original = e.target.files?.[0];
    if (!original) return;
    setUploading(true);
    try {
      const file = await compressImage(original);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
      if (data.url) onChange(data.url);
      else throw new Error('No URL returned');
    } catch (err: any) {
      alert('Lỗi upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="Preview" className="w-12 h-12 rounded-lg object-contain border border-gray-200 bg-white shrink-0" />
        )}
        <div className="relative flex-1">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
          />
          <Button type="button" variant="outline" size="sm" className="w-full pointer-events-none" disabled={uploading}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? 'Đang tải...' : 'Chọn file'}
          </Button>
        </div>
      </div>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Hoặc nhập link ảnh trực tiếp..."
        className="text-xs h-8"
      />
    </div>
  );
}
