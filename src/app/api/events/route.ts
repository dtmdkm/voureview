import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EventSale } from '@/models';

import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const events = await EventSale.find()
      .select('name slug image status startDate endDate createdAt')
      .sort({ createdAt: -1 });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    body.link = `/event/${body.slug}`;
    const event = await EventSale.create(body);
    revalidatePath('/');
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}
