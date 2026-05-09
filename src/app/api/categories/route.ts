import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({})
      .select('name slug icon link order createdAt')
      .sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newCategory = await Category.create(body);
    
    // On-demand revalidation
    revalidatePath('/');
    revalidatePath('/category');
    if (newCategory.slug) {
      revalidatePath(`/category/${newCategory.slug}`);
    }
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
