import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Deal, Store } from '@/models';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deal = await Deal.findById(id).populate('storeId').lean();
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    if (!body.storeId) delete body.storeId;
    const updatedDeal = await Deal.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (updatedDeal.storeId) {
      const store = await Store.findById(updatedDeal.storeId).lean() as any;
      if (store) revalidatePath(`/store/${store.slug}`);
    }
    
    return NextResponse.json(updatedDeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deletedDeal = await Deal.findByIdAndDelete(id);
    
    if (!deletedDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deletedDeal.storeId) {
      const store = await Store.findById(deletedDeal.storeId).lean() as any;
      if (store) revalidatePath(`/store/${store.slug}`);
    }
    revalidatePath('/deals');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
