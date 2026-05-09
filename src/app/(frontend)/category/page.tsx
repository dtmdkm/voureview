import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'All Categories | Boboreviews',
  description: 'Browse all categories to find the best coupons and deals for your favorite stores.',
};

export default async function CategoriesPage() {
  await connectToDatabase();
  const categories = await Category.find({}).sort({ name: 1 }).lean();

  return (
    <main className="container" style={{ padding: '40px 24px', minHeight: '60vh' }}>
      <div className="breadcrumb-nav" style={{ marginBottom: '20px' }}>
        <Link href="/">Home</Link> &gt; <span>Categories</span>
      </div>
      
      <div className="section-title" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text)' }}>Browse Categories</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
          Find the best coupons and deals organized by category.
        </p>
      </div>

      <div className="categories-grid">
        {categories
          .filter((cat: any) => cat.name && cat.name.trim())
          .map((cat: any) => (
            <Link 
              key={cat._id.toString()} 
              href={`/category/${cat.slug || ''}`} 
              className="category-btn"
              style={{ fontSize: '1rem', padding: '15px 30px' }}
            >
              {cat.name.trim()}
            </Link>
        ))}
      </div>
    </main>
  );
}
