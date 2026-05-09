import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ActivityLog } from '@/models';

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const log = await ActivityLog.create({ ...body, ip });
    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
