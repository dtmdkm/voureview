import { connectToDatabase } from '@/lib/mongodb';
import { BlogPost } from '@/models';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata = {
  title: 'Blog - Tech & Savings Articles',
  description: 'Read the latest articles about saving money, technology, and deals.',
};

export default async function BlogPage() {
  await connectToDatabase();
  
  const posts = await BlogPost.find({ status: 'active' }).sort({ createdAt: -1 }).lean();

  return (
    <main className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div className="breadcrumb-nav" style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <Link href="/">Home</Link> &nbsp;»&nbsp; <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Blog</span>
      </div>
      
      <div className="promo-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.4rem', color: '#111827' }}>Shopping Tips & Guides</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>
          Expert advice and insights to help you save more on every purchase.
        </p>
      </div>

      <div className="blog-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '30px'
      }}>
        {posts.map((post: any) => (
          <div key={post._id.toString()} className="sidebar-card" style={{ padding: '0', textAlign: 'left', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {post.image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              </>
            )}
            <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <h4 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '15px', lineHeight: 1.4 }}>{post.title}</h4>
              </Link>
              {post.summary && <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6, fontSize: '0.95rem' }}>{post.summary}</p>}
              <div style={{ marginTop: 'auto' }}>
                <Link href={`/blog/${post.slug}`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>Read Article &rarr;</Link>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="sidebar-card" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Our team is working on new articles. Stay tuned!</p>
            <Link href="/" style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '15px', display: 'inline-block' }}>Go back home &rarr;</Link>
          </div>
        )}
      </div>
    </main>
  );
}
