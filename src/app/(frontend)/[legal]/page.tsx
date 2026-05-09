import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/models';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const LEGAL_MAP: Record<string, { key: string; title: string; desc: string }> = {
  about: { key: 'page_about', title: 'About Us', desc: 'Learn more about Voureview and our mission.' },
  contact: { key: 'page_contact', title: 'Contact Us', desc: 'Get in touch with the Voureview team.' },
  privacy: { key: 'page_privacy', title: 'Privacy Policy', desc: 'How we collect and use your information.' },
  terms: { key: 'page_terms', title: 'Terms And Conditions', desc: 'Terms and conditions for using Voureview.' },
  affiliate: { key: 'page_affiliate', title: 'Affiliate Disclaimer', desc: 'Our affiliate relationship disclosure.' },
  cookie: { key: 'page_cookie', title: 'Cookie Policy', desc: 'How we use cookies on this website.' },
  imprint: { key: 'page_imprint', title: 'Imprint', desc: 'Legal notice and company information for Voureview.' },
};

export async function generateStaticParams() {
  return Object.keys(LEGAL_MAP).map(slug => ({ legal: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ legal: string }> }): Promise<Metadata> {
  const { legal } = await params;
  const page = LEGAL_MAP[legal];
  if (!page) return { title: 'Not Found' };
  return { title: `${page.title} | Voureview`, description: page.desc };
}

export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const { legal } = await params;
  const page = LEGAL_MAP[legal];
  if (!page) notFound();

  await connectToDatabase();
  const setting = await Setting.findOne({ key: page.key }).lean() as any;
  const content = setting?.value || '';

  return (
    <div className="container" style={{ maxWidth: '860px', margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary, #1a1a2e)' }}>
        {page.title}
      </h1>
      <div style={{ width: '48px', height: '4px', background: 'var(--primary, #3258b3)', borderRadius: '2px', marginBottom: '32px' }} />

      {content ? (
        <div
          className="legal-content"
          style={{ lineHeight: 1.8, color: '#374151', fontSize: '0.97rem' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: '1rem' }}>This page content is being updated.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            Please check back later or visit our <a href="/contact" style={{ color: 'var(--primary, #3258b3)' }}>contact page</a>.
          </p>
        </div>
      )}
    </div>
  );
}
