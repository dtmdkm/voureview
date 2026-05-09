import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal } from '@/models';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) return NextResponse.json({ stores: [], deals: [] });

  try {
    await connectToDatabase();

    const regex = { $regex: query, $options: 'i' };

    const [stores, deals] = await Promise.all([
      Store.find({ name: regex, status: 'active' })
        .select('name slug image')
        .limit(5)
        .lean(),
      Deal.find({ title: regex })
        .select('title slug storeId type discountValue discountPrice')
        .populate('storeId', 'name slug')
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({ stores, deals });
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
