import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { Category, Store } from '@/models';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateStaticParams() {
  await connectToDatabase();
  const categories = await Category.find({}).select('slug').lean();
  return categories.map((cat: any) => ({
    slug: cat.slug || '',
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const category = await Category.findOne({ slug: resolvedParams.slug }).lean();
  
  if (!category) return { title: 'Category Not Found' };
  
  return {
    title: category.seoTitle || `${category.name} Coupons & Deals`,
    description: category.seoDescription || `Find the best coupons and deals for ${category.name}.`,
    keywords: category.seoKeywords || `${category.name} coupons, discount codes`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  
  let category = await Category.findOne({ slug: resolvedParams.slug }).lean();
  
  if (!category) {
    // Thử tìm theo tên (thay dấu gạch ngang bằng dấu cách)
    const nameFromSlug = resolvedParams.slug.replace(/-/g, ' ');
    category = await Category.findOne({ 
      name: { $regex: new RegExp(`^${nameFromSlug}$`, 'i') } 
    }).lean();
  }
  
  if (!category) {
    notFound();
  }
  
  const stores = await Store.find({ 
    categoryId: category._id,
    status: 'active'
  }).lean();

  return (
    <main className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div className="breadcrumb-nav" style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <Link href="/">Home</Link> &nbsp;»&nbsp; <Link href="/category">Categories</Link> &nbsp;»&nbsp; <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{category.name}</span>
      </div>
      
      <div className="promo-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.4rem', color: '#111827', marginBottom: '10px' }}>{category.name} Coupons & Deals</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '800px' }}>
          Save money on your next purchase with verified {category.name} coupons and promo codes from top stores like {stores.slice(0, 3).map((s: any) => s.name).join(', ')}.
        </p>
      </div>

      <div className="stores-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '24px'
      }}>
        {stores.map((store: any) => {
          const initial = (store.name || 'S').substring(0, 2).toUpperCase();
          const imgSrc = store.image || `https://placehold.co/200x200/f8fafc/3258b3?text=${initial}`;
          return (
            <Link key={store._id.toString()} href={`/store/${store.slug}`} className="store-card">
              <div style={{ position: 'relative', width: '100%', height: '100px', marginBottom: '15px' }}>
                <img src={imgSrc} alt={store.name} style={{
                  width: '100%', height: '100%', objectFit: 'contain'
                }} />
              </div>
              <span className="store-name">{store.name}</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                {store.dealsCount || Math.floor(Math.random() * 10) + 2} verified offers
              </p>
            </Link>
          );
        })}
        {stores.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <span className="empty-state-icon">🛍️</span>
            <h3>No Stores Found</h3>
            <p>We couldn't find any stores in the <strong>{category.name}</strong> category at the moment.</p>
            <Link href="/category" className="btn-alert" style={{ display: 'inline-block', width: 'auto', padding: '12px 30px' }}>
              Explore Other Categories
            </Link>
          </div>
        )}
      </div>

      {category.content && (
        <div className="about-section fade-in" style={{ marginTop: '60px' }}>
          <h2>Shopping Guide for {category.name}</h2>
          <div 
            className="content-body" 
            dangerouslySetInnerHTML={{ __html: category.content }} 
          />
        </div>
      )}
    </main>
  );
}
