// Server Component — fetches blog posts directly from MongoDB
import { connectToDatabase } from '@/lib/mongodb';
import { BlogPost } from '@/models';
import BlogClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function AdminBlog() {
  await connectToDatabase();
  const rawPosts = await BlogPost.find({})
    .select('title slug summary category status createdAt')
    .sort({ createdAt: -1 })
    .lean();
  const posts = rawPosts.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    id: p._id.toString(),
    createdAt: p.createdAt?.toISOString() || null,
  }));

  return <BlogClientPage initialPosts={posts} />;
}
