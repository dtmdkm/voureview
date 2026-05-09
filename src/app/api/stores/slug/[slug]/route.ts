import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal } from '@/models';

export const revalidate = 300; // 5 minutes

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const store = await Store.findOne({ slug: params.slug, status: 'active' });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    
    // Fetch associated deals (only approved ones for storefront)
    const deals = await Deal.find({ 
      storeId: store._id,
      isApproved: { $ne: false } // Default to true if not explicitly false
    }).sort({ sortOrder: 1, createdAt: -1 });
    
    console.log(`Found ${deals.length} deals for store ${store.name} (${store._id})`);

    return NextResponse.json({ 
      ...store.toObject(), 
      id: store._id.toString(), 
      deals 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}
