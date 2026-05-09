// Server Component — loads all settings directly from MongoDB
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/models';
import SettingsClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function AdminSettings() {
  await connectToDatabase();
  const raw = await Setting.find({}).lean();

  // Convert array of {key, value} docs to a plain object
  const settings = raw.reduce((acc: any, s: any) => {
    acc[s.key] = s.value;
    return acc;
  }, {
    site_title: 'Voureview',
    site_logo: '',
    contact_email: '',
    footer_resources: [],
    footer_company: [],
    footer_notices: [],
    openai_api_key: '',
    openai_model: 'gpt-4o-mini',
    gemini_api_key: '',
    gemini_model: 'gemini-pro',
  });

  return <SettingsClientPage initialSettings={settings} />;
}
