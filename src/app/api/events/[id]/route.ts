import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EventSale } from '@/models';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const event = await EventSale.findById(id).lean();
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (body.slug) body.link = `/event/${body.slug}`;
    const event = await EventSale.findByIdAndUpdate(id, body, { new: true });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    revalidatePath('/');
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const event = await EventSale.findByIdAndDelete(id);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
