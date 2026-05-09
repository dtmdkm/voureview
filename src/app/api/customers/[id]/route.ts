import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CustomerLead } from '@/models';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();
  const lead = await CustomerLead.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(lead);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  await CustomerLead.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
