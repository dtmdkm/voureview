import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { EventSale, Store, Deal } from '@/models';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateStaticParams() {
  await connectToDatabase();
  const events = await EventSale.find({ status: 'active' }).select('slug').lean();
  return events.filter((e: any) => e.slug).map((e: any) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const event = await EventSale.findOne({ slug }).lean() as any;
  if (!event) return { title: 'Event Not Found' };
  const title = event.seoTitle || `${event.name} Coupons & Deals | Boboreviews`;
  const description = event.seoDescription || `Find the best ${event.name} deals, promo codes and coupons from top stores.`;
  return {
    title,
    description,
    keywords: event.seoKeywords || `${event.name} coupons, ${event.name} deals, promo codes`,
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectToDatabase();

  const event = await EventSale.findOne({ slug }).lean() as any;
  if (!event) notFound();

  const stores = await Store.find({
    eventId: event._id,
    status: 'active',
    isApproved: true,
  }).select('name slug image description').lean();

  const storeIds = stores.map((s: any) => s._id);
  const deals = await Deal.find({
    storeId: { $in: storeIds },
    isApproved: true,
  })
    .select('title storeId type discountValue discountPrice code link isVerified clicks')
    .populate('storeId', 'name slug')
    .sort({ clicks: -1 })
    .limit(20)
    .lean();

  const EVENT_ICONS: Record<string, string> = {
    'black-friday': '🛍️',
    'boxing-day': '📦',
    'christmas': '🎄',
    'halloween': '🎃',
    'thanksgiving': '🦃',
    'valentine': '❤️',
  };
  const icon = EVENT_ICONS[slug] || '🎉';

  return (
    <main className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb-nav" style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <Link href="/">Home</Link> &nbsp;»&nbsp;
        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{event.name}</span>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '24px',
        padding: '48px 40px',
        marginBottom: '48px',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{icon}</div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>
          {event.name} Coupons & Deals
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          Exclusive {event.name} discounts from {stores.length} top stores — verified and updated daily.
        </p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '28px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8' }}>{stores.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Stores</div>
          </div>
          <div style={{ width: '1px', background: '#334155' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>{deals.length}+</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Deals</div>
          </div>
        </div>
      </div>

      {/* Top Deals */}
      {deals.length > 0 && (
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
            Top {event.name} Deals
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {deals.map((deal: any) => {
              const store = deal.storeId as any;
              return (
                <div key={deal._id?.toString()} className="coupon-card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr 180px', gap: '0', alignItems: 'center', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {/* Left: discount */}
                  <div className="deal-left" style={{ background: '#f8fafc', borderRight: '1px dashed #e2e8f0', padding: '24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#eb004a', whiteSpace: 'nowrap' }}>
                      {deal.discountValue || deal.discountPrice || (deal.type === 'code' ? 'CODE' : 'DEAL')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                      {deal.type === 'code' ? 'Coupon' : 'Off'}
                    </span>
                  </div>
                  {/* Middle: info */}
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '6px', lineHeight: 1.4 }}>{deal.title}</div>
                    {store?.name && (
                      <Link href={`/store/${store.slug}`} style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>
                        {store.name}
                      </Link>
                    )}
                    {deal.code && (
                      <div style={{ marginTop: '8px', display: 'inline-block', background: '#ede9fe', color: '#7c3aed', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', fontFamily: 'monospace' }}>
                        {deal.code}
                      </div>
                    )}
                  </div>
                  {/* Right: CTA */}
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <a
                      href={deal.link}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      style={{ display: 'inline-block', background: '#eb004a', color: 'white', padding: '12px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      {deal.type === 'code' ? 'Get Code' : 'Get Deal'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stores Grid */}
      <section>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
          {event.name} Stores
        </h2>
        {stores.length > 0 ? (
          <div className="stores-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            {stores.map((store: any) => {
              const initial = (store.name || 'S').substring(0, 2).toUpperCase();
              const imgSrc = store.image || `https://placehold.co/200x200/f8fafc/3258b3?text=${initial}`;
              return (
                <Link key={store._id?.toString()} href={`/store/${store.slug}`} className="store-card">
                  <div style={{ position: 'relative', width: '100%', height: '90px', marginBottom: '12px' }}>
                    <img src={imgSrc} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <span className="store-name">{store.name}</span>
                  {store.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                      {store.description}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No stores found for {event.name} yet.</p>
            <Link href="/deals" style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '12px', display: 'inline-block' }}>
              Browse all deals →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
