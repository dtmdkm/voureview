import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Store } from '@/models';
import { revalidatePath } from 'next/cache';
import { shouldRevalidate, smartRevalidateStore } from '@/lib/revalidateLogic';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const store = await Store.findById(params.id);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const data = await request.json();
    
    // Tự động tạo slug nếu bị xóa hoặc không có
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    // Đảm bảo không update ID
    delete data.id;
    delete data._id;
    // Remove empty ObjectId fields to avoid CastError
    if (!data.categoryId) delete data.categoryId;
    if (!data.eventId) delete data.eventId;

    // Lấy dữ liệu cũ để so sánh
    const oldStore = await Store.findById(params.id).lean();
    if (!oldStore) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const store = await Store.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
    
    // On-demand revalidation thông minh
    const needsRevalidate = shouldRevalidate(oldStore, data);
    smartRevalidateStore(store.slug, store.categoryId, needsRevalidate);

    return NextResponse.json(store);
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return NextResponse.json({ 
        error: `Giá trị '${value}' của trường '${field}' đã tồn tại. Vui lòng chọn giá trị khác.` 
      }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update store' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const store = await Store.findByIdAndDelete(params.id);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    revalidatePath(`/store/${store.slug}`);
    revalidatePath('/');
    
    return NextResponse.json({ message: 'Store deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 });
  }
}
