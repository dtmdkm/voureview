import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Store, BlogPost, Category } from '@/models';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voureview.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();

  const [stores, posts, categories] = await Promise.all([
    Store.find({ status: 'active' }).select('slug updatedAt').lean(),
    BlogPost.find({ status: 'active' }).select('slug updatedAt').lean(),
    Category.find({ slug: { $exists: true, $ne: '' } }).select('slug updatedAt').lean(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/category`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/affiliate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/cookie`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const storePages: MetadataRoute.Sitemap = (stores as any[]).map(s => ({
    url: `${BASE_URL}/store/${s.slug}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts as any[]).map(p => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = (categories as any[])
    .filter((c: any) => c.slug && c.slug !== '-')
    .map((c: any) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...staticPages, ...storePages, ...blogPages, ...categoryPages];
}
