import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/mongodb';
import { Store } from '@/models';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const list = searchParams.get('list');

    let query = Store.find().sort({ createdAt: -1 });

    if (list === '1') {
      query = query.select('-image -banner -content -faqs -seoTitle -seoKeywords -seoDescription');
    }

    const stores = await query.lean();
    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();

    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Remove empty ObjectId fields to avoid CastError
    if (!data.categoryId) delete data.categoryId;
    if (!data.eventId) delete data.eventId;

    const store = await Store.create(data);

    revalidatePath('/');

    return NextResponse.json(store);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug đã tồn tại, vui lòng chọn slug khác' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create store' }, { status: 500 });
  }
}
