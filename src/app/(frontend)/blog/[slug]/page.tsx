import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { BlogPost } from '@/models';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const { slug } = await params;
  const post = await BlogPost.findOne({ slug }).lean();
  
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.summary,
    keywords: post.seoKeywords,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const { slug } = await params;
  
  const post = await BlogPost.findOne({ slug }).lean();
  
  if (!post || post.status !== 'active') {
    notFound();
  }

  return (
    <main className="container store-page-container" style={{ padding: '40px 24px', minHeight: '60vh' }}>
      <div className="breadcrumb-nav" style={{ marginBottom: '20px' }}>
        <a href="/">Home</a> &gt; <a href="/blog">Blog</a> &gt; <span>{post.title}</span>
      </div>
      
      <article className="post-container">
        <header className="post-header" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '20px', fontWeight: 800 }}>{post.title}</h1>
          <div className="post-meta" style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
            {post.category && <span style={{ marginRight: '20px' }}>📁 {post.category}</span>}
            <span>📅 {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
          </div>
        </header>

        {post.image && (
          <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '24px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
        )}

        <div 
          className="post-content" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
          style={{ lineHeight: 1.8, color: '#334155', fontSize: '1.1rem' }}
        />
      </article>
    </main>
  );
}
