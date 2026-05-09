import { connectToDatabase } from '@/lib/mongodb';
import { Category, Store } from '@/models';
import CategoriesClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function CategoriesManagement() {
  await connectToDatabase();

  const [rawCategories, rawStores] = await Promise.all([
    Category.find({}).select('name slug icon link').sort({ name: 1 }).lean(),
    Store.find({}).sort({ name: 1 }).select('name categoryId slug').lean(),
  ]);

  const serialize = (arr: any[]) => arr.map((d: any) => ({
    ...d,
    _id: d._id.toString(),
    id: d._id.toString(),
    categoryId: d.categoryId?.toString() || null,
    createdAt: d.createdAt?.toISOString() || null,
  }));

  return (
    <CategoriesClientPage
      initialCategories={serialize(rawCategories)}
      initialStores={serialize(rawStores)}
    />
  );
}
