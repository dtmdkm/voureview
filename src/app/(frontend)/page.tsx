import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal, BlogPost, Setting } from '@/models';
import Link from 'next/link';
import Image from 'next/image';
import CarouselWrapper from './CarouselWrapper';
import HeroSlider from './HeroSlider';
import AlphabetFilter from './AlphabetFilter';

export const revalidate = 3600; // Cache 1 giờ

const defaultBanners = [
  { id: 1, title: 'Save Big and Slay', desc: 'Get 15% off', bg: '#001d5e', link: '/deals' },
  { id: 2, title: 'Enjoy your Vacations', desc: 'Get 25% off', bg: '#FF575B', link: '/deals' },
  { id: 3, title: 'Take care of your furbabies', desc: 'Get 10% Cash Back', bg: '#001340', link: '/deals' },
];

export default async function HomePage() {
  await connectToDatabase();

  const [popularStores, deals, blogPosts, bannerSetting] = await Promise.all([
    Store.find({ status: 'active' })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(24)
      .select('name slug image')
      .lean(),
    Deal.find({})
      .sort({ isFeatured: -1, clicks: -1 })
      .limit(10)
      .select('title slug storeId type discountValue discountPrice')
      .populate('storeId', 'name slug image')
      .lean(),
    BlogPost.find({ status: 'active' })
      .select('title slug image summary createdAt')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Setting.findOne({ key: 'home_banners' }).lean(),
  ]);

  const banners = ((bannerSetting as any)?.value || defaultBanners).filter((b: any) => b.isActive !== false);

  const stores = popularStores as any[];
  const activeDeals = (deals as any[]).filter((d) => d.storeId != null);
  const posts = blogPosts as any[];

  return (
    <>
      {/* 1. Banner Slider */}
      <section className="banner-sec">
        <HeroSlider banners={banners} />
      </section>

      {/* 2. Main Title */}
      <div className="sec-main-title container">
        <h1>Find The Best Verified Deals and Promo Codes For Today</h1>
        <h2>Trending Store</h2>
      </div>

      {/* 3. Alphabet Filter & Store List */}
      <section className="coupon-stores-sec container">
        <AlphabetFilter stores={stores} />
      </section>

      {/* 4. Top Picks */}
      <CarouselWrapper title="Top Picks">
        {stores.slice(0, 6).map((store, idx) => {
          const initial = (store.name || 'S').substring(0, 2).toUpperCase();
          const imgSrc = store.image || `https://placehold.co/400x220/f1f1f1/001d5e?text=${encodeURIComponent(initial)}`;
          return (
            <div key={store._id} className="swiper-slide">
              <div className="cash-back-card">
                <Link prefetch={false} href={`/store/${store.slug}`}>
                  <Image
                    src={imgSrc}
                    alt={store.name}
                    width={400}
                    height={220}
                    style={{ objectFit: 'contain', background: '#f5f5f5' }}
                    unoptimized={!store.image}
                  />
                  <div className="cash-back-info">
                    <h3>{store.name}</h3>
                    <span>+Up to {(idx * 2 % 5) + 2}% Cash Back</span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </CarouselWrapper>

      {/* 5. Featured Shops */}
      <CarouselWrapper title="Featured Shops" className="cash-back-sec cash-back-apps container">
        {stores.slice(0, 8).map((store, idx) => {
          const initial = (store.name || 'S').substring(0, 2).toUpperCase();
          return (
            <div key={store._id} className="swiper-slide logo-slide">
              <div className="cash-back-card">
                <Link prefetch={false} href={`/store/${store.slug}`}>
                  <Image
                    src={store.image || `https://placehold.co/220x110/fff/333?text=${initial}`}
                    alt={store.name}
                    width={220}
                    height={110}
                    style={{ objectFit: 'contain' }}
                    unoptimized={!store.image}
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </CarouselWrapper>

      {/* 6. Offers Of The Week */}
      <CarouselWrapper title="Offers Of The Week" className="cash-back-sec top-deals-sec container">
        {activeDeals.slice(0, 6).map((deal, idx) => {
          const storeName = deal.storeId?.name || 'Store';
          return (
            <div key={deal._id} className="swiper-slide offer-slide">
              <div className="cash-back-card">
                <Link prefetch={false} href={`/store/${deal.storeId?.slug || '#'}`}>
                  <Image
                    src={deal.storeId?.image || `https://placehold.co/220x110/fff/333?text=${encodeURIComponent(storeName)}`}
                    alt={storeName}
                    width={220}
                    height={110}
                    style={{ objectFit: 'contain' }}
                    unoptimized={!deal.storeId?.image}
                  />
                  <div className="cash-back-info text-center">
                    <h3>{(idx * 4 % 10) + 2} Coupons</h3>
                    <span>{deal.discountValue || deal.discountPrice || '50% OFF'}</span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </CarouselWrapper>
    </>
  );
}
