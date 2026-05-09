import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CustomerLead } from '@/models';

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    CustomerLead.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    CustomerLead.countDocuments()
  ]);
  return NextResponse.json({ leads, total });
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, name, message, source, storeId } = body;
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const lead = await CustomerLead.create({ email, name, message, source: source || 'contact', storeId: storeId || undefined, ip });
    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
