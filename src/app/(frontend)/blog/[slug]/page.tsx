import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { BlogPost } from '@/models';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  await connectToDatabase();
  const post = await BlogPost.findOne({ slug: params.slug }).lean();
  
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.summary,
    keywords: post.seoKeywords,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  await connectToDatabase();
  
  const post = await BlogPost.findOne({ slug: params.slug }).lean();
  
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
          <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '20px' }}>{post.title}</h1>
          <div className="post-meta" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {post.category && <span style={{ marginRight: '20px' }}>📁 {post.category}</span>}
            <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        {post.image && (
          <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '24px', marginBottom: '40px' }} />
        )}

        <div 
          className="post-content" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
          style={{ lineHeight: 1.8, color: '#cbd5e1', fontSize: '1.1rem' }}
        />
      </article>
    </main>
  );
}
