import { connectToDatabase } from '@/lib/mongodb';
import { Store } from '@/models';
import Link from 'next/link';
import StoresClient from './StoresClient';

// Static page - pre-render at build time, revalidate every hour
export const revalidate = 3600;

export const metadata = {
  title: 'Stores - All Coupon Stores | Voureview',
  description: 'Browse all stores and find the best coupons, promo codes and deals.',
};

export default async function StoresPage() {
  await connectToDatabase();

  // Load ALL stores once at build time → cached for 1 hour
  const stores = (await Store.find({ status: 'active' })
    .sort({ name: 1 })
    .select('name slug image')
    .lean()) as any[];

  const serialized = JSON.parse(JSON.stringify(stores));

  return (
    <div className="stores-page">
      {/* Page Header */}
      <div className="stores-page-header">
        <h1>Stores</h1>
        <nav className="stores-breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span className="active">Stores</span>
        </nav>
      </div>

      {/* Disclaimer */}
      <div className="stores-disclaimer container">
        <p>
          We may earn a commission if you make a purchase through our{' '}
          <Link href="/about">links</Link>.
        </p>
      </div>

      {/* Client component handles A-Z filter + grid */}
      <StoresClient stores={serialized} />
    </div>
  );
}
