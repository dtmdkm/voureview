// Server Component — loads legal page content directly from MongoDB
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/models';
import LegalClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

const LEGAL_KEYS = ['page_about', 'page_contact', 'page_privacy', 'page_terms', 'page_affiliate', 'page_cookie'];

export default async function AdminLegal() {
  await connectToDatabase();
  const raw = await Setting.find({ key: { $in: LEGAL_KEYS } }).lean();

  const contents = raw.reduce((acc: any, s: any) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  return <LegalClientPage initialContents={contents} />;
}
