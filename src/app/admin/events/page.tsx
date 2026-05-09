// Server Component
import { connectToDatabase } from '@/lib/mongodb';
import { EventSale } from '@/models';
import EventsClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function AdminEvents() {
  await connectToDatabase();
  const rawEvents = await EventSale.find({})
    .select('name slug link icon status createdAt')
    .sort({ createdAt: -1 })
    .lean();
  const events = rawEvents.map((e: any) => ({
    ...e,
    _id: e._id.toString(),
    id: e._id.toString(),
    createdAt: e.createdAt?.toISOString() || null,
  }));

  return <EventsClientPage initialEvents={events} />;
}
