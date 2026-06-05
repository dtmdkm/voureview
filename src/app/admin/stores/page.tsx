import { connectToDatabase } from '@/lib/mongodb';
import { Store, Category, EventSale, Deal } from '@/models';
import ClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function StoresPage() {
  await connectToDatabase();

  // Fetch all data in parallel on the server
  const [stores, categories, events, deals] = await Promise.all([
    Store.find().sort({ createdAt: -1 }).select('name slug image categoryId status isFeatured isApproved createdAt updatedAt').lean(),
    Category.find().select('name id _id').lean(),
    EventSale.find().select('name id _id').lean(),
    Deal.find().select('storeId clicks').lean()
  ]);

  // Aggregate deal stats on the server
  const dealStats: Record<string, { count: number; clicks: number }> = {};
  for (const d of (deals as any[])) {
    const sid = d.storeId?.toString();
    if (!sid) continue;
    if (!dealStats[sid]) dealStats[sid] = { count: 0, clicks: 0 };
    dealStats[sid].count += 1;
    dealStats[sid].clicks += d.clicks || 0;
  }

  return (
    <ClientPage 
      initialStores={JSON.parse(JSON.stringify(stores))} 
      categories={JSON.parse(JSON.stringify(categories))}
      events={JSON.parse(JSON.stringify(events))}
      dealStats={dealStats}
    />
  );
}
