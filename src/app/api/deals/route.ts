import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Deal, Store } from '@/models';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('statsOnly');

    if (statsOnly === '1') {
      // Lightweight: only storeId and clicks, no populate, no images
      const deals = await Deal.find({}).select('storeId clicks').lean();
      return NextResponse.json(deals);
    }

    const deals = await Deal.find()
      .select('title storeId type discountValue clicks status isApproved isVerified createdAt updatedAt')
      .populate('storeId', 'name image')
      .sort({ createdAt: -1 });
    return NextResponse.json(deals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    if (!data.storeId) delete data.storeId;
    const deal = await Deal.create(data);

    if (deal.storeId) {
      const store = await Store.findById(deal.storeId).lean() as any;
      if (store) revalidatePath(`/store/${store.slug}`);
    }
    revalidatePath('/deals');

    return NextResponse.json(deal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create deal' }, { status: 500 });
  }
}
