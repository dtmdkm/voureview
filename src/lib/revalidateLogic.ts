import { revalidatePath } from 'next/cache';

// Lọc các trường thay đổi quan trọng để tránh revalidate lãng phí
export function shouldRevalidate(oldData: any, newData: any): boolean {
  if (!oldData) return true; // Nếu tạo mới, luôn revalidate
  
  // Các trường không ảnh hưởng đến giao diện chính cần revalidate ngay lập tức
  const ignoredFields = ['clicks', 'views', 'updatedAt', 'lastActive', 'createdAt'];
  
  // Kiểm tra xem có trường nào ngoài ignoredFields bị thay đổi không
  for (const key of Object.keys(newData)) {
    if (ignoredFields.includes(key)) continue;
    
    // Nếu giá trị khác nhau, có nghĩa là đã có thay đổi quan trọng
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      return true;
    }
  }
  return false;
}

// Only revalidate frontend cached pages — admin pages are force-dynamic and never cached
export function smartRevalidateStore(storeSlug: string, categoryId?: string, force: boolean = false) {
  if (!force) return;
  revalidatePath(`/store/${storeSlug}`);
  revalidatePath('/');
  if (categoryId) revalidatePath(`/category`);
}
