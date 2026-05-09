import { connectToDatabase } from '@/lib/mongodb';
import { Deal, Store } from '@/models';
import DealsClient from './DealsClient';

export const revalidate = 3600;

export const metadata = {
  title: 'All Deals & Coupons | Voureview',
  description: 'Browse the latest deals, coupons and promo codes from your favorite stores.',
};

export default async function DealsPage() {
  await connectToDatabase();

  const [deals, stores] = await Promise.all([
    Deal.find({}).populate('storeId').sort({ sortOrder: 1, createdAt: -1 }).lean(),
    Store.find({ status: 'active' }).lean(),
  ]);

  const activeStoreIds = new Set(stores.map((s: any) => s._id.toString()));
  const activeDeals = deals.filter((deal: any) => {
    const sid = deal.storeId?._id?.toString() || deal.storeId?.toString();
    return activeStoreIds.has(sid);
  });

  const serialize = (d: any) => JSON.parse(JSON.stringify(d));

  return <DealsClient deals={serialize(activeDeals)} />;
}
