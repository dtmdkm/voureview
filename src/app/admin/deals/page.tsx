import { connectToDatabase } from '@/lib/mongodb';
import { Deal, Store } from '@/models';
import ClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  await connectToDatabase();

  const [deals, stores] = await Promise.all([
    Deal.find()
      .select('title storeId type discountValue clicks status isApproved isVerified createdAt updatedAt')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    Store.find().sort({ name: 1 }).select('name id _id').lean()
  ]);

  return (
    <ClientPage 
      initialDeals={JSON.parse(JSON.stringify(deals))} 
      initialStores={JSON.parse(JSON.stringify(stores))} 
    />
  );
}
