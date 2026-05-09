import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/models';

const LEGAL_KEYS = ['page_about', 'page_contact', 'page_privacy', 'page_terms', 'page_affiliate', 'page_cookie'];

export async function GET() {
  await connectToDatabase();
  const settings = await Setting.find({ key: { $in: LEGAL_KEYS } });
  const result: any = {};
  settings.forEach((s: any) => { result[s.key] = s.value; });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { key, value } = await request.json();
    if (!LEGAL_KEYS.includes(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
    await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
