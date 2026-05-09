import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal, BlogPost } from '@/models';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Kết quả tìm kiếm: "${q}" | Boboreviews` : 'Tìm kiếm | Boboreviews',
    description: 'Tìm kiếm cửa hàng, deals và bài viết tại Boboreviews.',
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q || '').trim();

  if (!query) {
    return (
      <div className="container" style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px', textAlign: 'center', color: '#9ca3af' }}>
        <p style={{ fontSize: '1.1rem' }}>Nhập từ khóa để tìm kiếm cửa hàng, deals hoặc bài viết.</p>
      </div>
    );
  }

  await connectToDatabase();
  const regex = new RegExp(query, 'i');

  const [stores, deals, posts] = await Promise.all([
    Store.find({ status: 'active', $or: [{ name: regex }, { slug: regex }, { description: regex }] }).limit(10).lean(),
    Deal.find({ $or: [{ title: regex }, { description: regex }, { code: regex }] }).populate('storeId', 'name slug').limit(10).lean(),
    BlogPost.find({ status: 'active', $or: [{ title: regex }, { summary: regex }] }).limit(6).lean(),
  ]);

  const total = stores.length + deals.length + posts.length;

  return (
    <div className="container" style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
        Kết quả tìm kiếm: &ldquo;{query}&rdquo;
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '0.9rem' }}>Tìm thấy {total} kết quả</p>

      {stores.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>Cửa hàng ({stores.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {(stores as any[]).map(store => (
              <Link key={store._id?.toString()} href={`/store/${store.slug}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.2s' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '8px' }}>
                  <Image src={store.image || '/favicon.png'} alt={store.name} fill sizes="64px" style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>{store.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>Deals ({deals.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(deals as any[]).map(deal => (
              <a key={deal._id?.toString()} href={deal.link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem', color: '#d97706', whiteSpace: 'nowrap' }}>
                  {deal.discountValue || deal.discountPrice || 'DEAL'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{deal.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{(deal.storeId as any)?.name || ''}</div>
                </div>
                {deal.code && (
                  <div style={{ background: '#f3f4f6', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#374151' }}>
                    {deal.code}
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>Bài viết ({posts.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {(posts as any[]).map(post => (
              <Link key={post._id?.toString()} href={`/blog/${post.slug}`}
                style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>{post.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.summary || ''}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không tìm thấy kết quả nào cho &ldquo;{query}&rdquo;</p>
          <p style={{ fontSize: '0.9rem' }}>Thử tìm kiếm với từ khóa khác.</p>
        </div>
      )}
    </div>
  );
}
