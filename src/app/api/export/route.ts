import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal, Category, BlogPost } from '@/models';

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'stores';

  let data: any[] = [];
  let filename = 'export.json';

  if (type === 'stores') {
    data = await Store.find({}).lean();
    filename = 'stores.json';
  } else if (type === 'deals') {
    data = await Deal.find({}).populate('storeId', 'name slug').lean();
    filename = 'deals.json';
  } else if (type === 'categories') {
    data = await Category.find({}).lean();
    filename = 'categories.json';
  } else if (type === 'blog') {
    data = await BlogPost.find({}).lean();
    filename = 'blog.json';
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
