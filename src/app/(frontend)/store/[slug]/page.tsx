import { connectToDatabase } from '@/lib/mongodb';
import { Store, Setting, EventSale, Deal } from '@/models';
import StoreClient from './StoreClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';
import Image from 'next/image';

export const revalidate = 3600; // 1 hour cache

export async function generateStaticParams() {
  await connectToDatabase();
  const stores = await Store.find({ status: 'active' }).select('slug').lean();
  return stores.map((store: any) => ({
    slug: store.slug,
  }));
}

const getCachedStore = cache(async (slug: string) => {
  await connectToDatabase();
  return await Store.findOne({ slug, status: 'active' }).lean();
});

// Heavy Loader: Fetches Deals, Settings, and EventSales in parallel
async function ContentLoader({ storeId, storeData }: any) {
  const [deals, settingsList, eventSales] = await Promise.all([
    Deal.find({ storeId, isApproved: true }).select('title slug storeId type clicks discountValue discountPrice price code link isVerified isFeatured expireAt createdAt').sort({ sortOrder: 1, createdAt: -1 }).lean(),
    Setting.find({}).lean(),
    EventSale.find({ status: 'active' }).lean()
  ]);

  const settings = settingsList.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const serializedData = JSON.parse(JSON.stringify({ ...storeData, deals }));
  
  return (
    <StoreClient 
      data={serializedData} 
      settings={JSON.parse(JSON.stringify(settings))} 
      eventSales={JSON.parse(JSON.stringify(eventSales))} 
      hideHero={true} 
    />
  );
}

function StoreHeroShell({ store }: any) {
  const isDataUrl = (src: string) => src?.startsWith('data:');
  return (
    <section id="store-hero" className="container fade-in" style={{ marginTop: '20px' }}>
      {store.banner && (
        <div className="store-banner-wrap" style={{ position: 'relative', width: '100%', height: '250px', overflow: 'hidden', borderRadius: '24px' }}>
          {isDataUrl(store.banner) ? (
            // Base64 uploaded images: use regular img (next/image doesn't support data URLs)
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            // External URL: use next/image with optimization
            <Image src={store.banner} alt="Banner" fill priority style={{ objectFit: 'cover' }} />
          )}
        </div>
      )}
      <div className="store-profile-header">
        <div className="store-logo-wrap" style={{ position: 'relative', width: '120px', height: '120px' }}>
          {isDataUrl(store.image || '') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.image || '/favicon.png'} alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
          ) : (
            <Image src={store.image || '/favicon.png'} alt="Logo" width={120} height={120} priority style={{ objectFit: 'contain' }} />
          )}
        </div>
        <div className="store-info-wrap">
          <h1 className="store-title-main">{store.name}</h1>
        </div>
      </div>
    </section>
  );
}

function ContentSkeleton() {
  return (
    <div className="container store-layout" style={{ marginTop: '40px' }}>
      <div className="skeleton skeleton-sidebar"></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-deal-card"></div>
        <div className="skeleton skeleton-deal-card"></div>
        <div className="skeleton skeleton-deal-card"></div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const store: any = await getCachedStore(resolvedParams.slug);
  if (!store) return { title: 'Store Not Found' };
  const title = store.seoTitle || `${store.name} Coupons & Promo Codes | Voureview`;
  const description = store.seoDescription || store.description || `Get the latest ${store.name} coupons and deals verified today.`;
  return {
    title,
    description,
    keywords: store.seoKeywords || undefined,
    openGraph: { title, description, type: 'website', images: store.banner ? [store.banner] : [] },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // 1. Fetch ONLY the store (Cached) - This determines the shell
  const store: any = await getCachedStore(resolvedParams.slug);
  if (!store) notFound();

  const serializedStore = JSON.parse(JSON.stringify(store));

  return (
    <>
      {/* 2. Show the Hero shell INSTANTLY */}
      <StoreHeroShell store={serializedStore} />

      {/* 3. Suspend ALL other data fetching */}
      <Suspense fallback={<ContentSkeleton />}>
        <ContentLoader 
          storeId={store._id} 
          storeData={serializedStore} 
        />
      </Suspense>
    </>
  );
}
