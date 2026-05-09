import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal, BlogPost, Setting, Category } from '@/models';
import { Search, CreditCard, Heart, BarChart3, BellRing, ArrowRight } from 'lucide-react';
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

  const [popularStores, deals, blogPosts, popularCategories, bannerSetting] = await Promise.all([
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
      .limit(3)
      .lean(),
    Category.find({})
      .select('name slug')
      .limit(20)
      .lean(),
    Setting.findOne({ key: 'home_banners' }).lean(),
  ]);

  const banners = ((bannerSetting as any)?.value || defaultBanners).filter((b: any) => b.isActive !== false);

  const stores = popularStores as any[];
  const activeDeals = (deals as any[]).filter((d) => d.storeId != null);
  const posts = blogPosts as any[];
  const categories = popularCategories as any[];

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
        <div className="text-center" style={{ marginTop: '40px' }}>
          <Link href="/stores" className="btn-see-more">
            See More Stores
          </Link>
        </div>
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
 
      {/* 7. Latest Blogs */}
      <section className="latest-blogs-sec container">
        <div className="sec-header">
          <h2>Latest Blogs</h2>
        </div>
        <div className="blogs-grid">
          {posts.map((post) => (
            <div key={post._id} className="blog-card">
              <Link href={`/blog/${post.slug}`} className="blog-image">
                <Image 
                  src={post.image || `https://placehold.co/600x300/f1f1f1/001d5e?text=${encodeURIComponent(post.title)}`}
                  alt={post.title}
                  width={600}
                  height={300}
                  className="object-cover"
                  unoptimized={!post.image}
                />
              </Link>
              <div className="blog-content">
                <h3>{post.title}</h3>
                <p>{post.summary || 'Valentine\'s Day is the most perfect time to express love and appreciation...'}</p>
                <Link href={`/blog/${post.slug}`} className="read-more">
                  Read More <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* 8. Popular Categories */}
      <section className="popular-categories-sec container">
        <div className="sec-header">
          <h2>Popular Categories</h2>
        </div>
        <div className="categories-list">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/category/${cat.slug}`} className="category-item">
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
 
      {/* 9. Maximize Your Savings (Static) */}
      <section className="savings-sec">
        <div className="container">
          <div className="sec-header text-center">
            <h2>Maximize Your Savings</h2>
          </div>
          <div className="savings-grid">
            <div className="savings-item">
              <div className="savings-icon"><Search size={32} strokeWidth={1.5} /></div>
              <h3>Comparison Shopping</h3>
              <p>We show you new, used, local, rental, refurbished, and more shopping options to find you the lowest price.</p>
            </div>
            <div className="savings-item">
              <div className="savings-icon"><CreditCard size={32} strokeWidth={1.5} /></div>
              <h3>Cash Back</h3>
              <p>Shop like usual and earn cash back at 4,500+ stores.</p>
            </div>
            <div className="savings-item">
              <div className="savings-icon"><Heart size={32} strokeWidth={1.5} /></div>
              <h3>Coupons</h3>
              <p>Never look for coupons again. We do it for you within seconds.</p>
            </div>
            <div className="savings-item">
              <div className="savings-icon"><BarChart3 size={32} strokeWidth={1.5} /></div>
              <h3>Price History</h3>
              <p>Prices fluctuate. See the cost over time to know if it's the right time to buy.</p>
            </div>
            <div className="savings-item">
              <div className="savings-icon"><BellRing size={32} strokeWidth={1.5} /></div>
              <h3>Price Drop Alerts</h3>
              <p>Get notified when your saved item goes on sale; just set the price you would like to pay!</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
