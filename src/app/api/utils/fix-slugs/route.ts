import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Store } from '@/models';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Chuẩn hóa tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    await connectToDatabase();
    const stores = await Store.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
    
    let fixedCount = 0;
    for (const store of stores) {
      const newSlug = slugify(store.name);
      // Kiểm tra trùng lặp slug
      let finalSlug = newSlug;
      let counter = 1;
      while (await Store.findOne({ slug: finalSlug, _id: { $ne: store._id } })) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }
      
      store.slug = finalSlug;
      await store.save();
      fixedCount++;
    }

    return NextResponse.json({ 
      message: `Đã sửa thành công ${fixedCount} cửa hàng thiếu slug.`,
      fixedStores: stores.map(s => ({ name: s.name, slug: s.slug }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
