import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BlogPost } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const posts = await BlogPost.find()
      .select('title slug image summary category status createdAt')
      .sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    if (!body.slug) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const post = await BlogPost.create(body);
    
    // Clear the cache so the homepage and blog page show the new post immediately
    revalidatePath('/');
    revalidatePath('/blog');
    
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
