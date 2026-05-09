import './frontend.css';
import { connectToDatabase } from '@/lib/mongodb';
import { EventSale, Setting } from '@/models';
import Link from 'next/link';
import { Inter, Outfit } from 'next/font/google';
import SearchBar from './SearchBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const revalidate = 3600; // 1 hour edge cache

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voureview | Leading Coupons & Deals Marketplace',
  description: 'Leading Coupons & Deals Marketplace',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectToDatabase();
  
  const [eventSales, settingsList] = await Promise.all([
    EventSale.find({ status: 'active' }).lean(),
    Setting.find({}).lean()
  ]);

  const settings: any = settingsList[0] || {};

  const footerData = {
    resources: settings.footer_resources || [],
    company: settings.footer_company || [],
    notices: settings.footer_notices || []
  };

  return (
    <div className={`frontend-wrapper ${inter.variable} ${outfit.variable}`}>
      <div className="frontend-body">
        <header className="site-header">
          <div className="container header-inner">
            <Link prefetch={false} href="/" className="logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Voureview Logo" className="logo-img" />
              <span className="logo-text">Voureview</span>
            </Link>
            <nav className="site-nav">
              <Link prefetch={false} href="/">Home</Link>
              <Link prefetch={false} href="/blog">Blogs</Link>
              <Link prefetch={false} href="/stores">Stores</Link>
              <Link prefetch={false} href="/category">Categories</Link>
            </nav>
            <div className="header-search-wrapper">
              <SearchBar />
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>

        <footer className="site-footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col">
                <h4>About Website</h4>
                <ul>
                  <li><Link prefetch={false} href="/about">About Us</Link></li>
                  <li><Link prefetch={false} href="/contact">Contact Us</Link></li>
                  <li><Link prefetch={false} href="/privacy">Privacy Policy</Link></li>
                  <li><Link prefetch={false} href="/imprint">Imprint</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Coupons</h4>
                <ul>
                  <li><Link prefetch={false} href="/stores">Stores</Link></li>
                  <li><Link prefetch={false} href="/category">Categories</Link></li>
                  <li><Link prefetch={false} href="/blog">Blogs</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Legal Information</h4>
                <ul>
                  <li><Link prefetch={false} href="/affiliate">Affiliate Disclaimer</Link></li>
                  <li><Link prefetch={false} href="/terms">Terms And Conditions</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Subscribe</h4>
                <p className="footer-text">Never miss another deal! Save big on everything with the latest coupons and promo codes.</p>
                <div className="footer-social">
                  <a href="#" aria-label="Facebook"><svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                  <a href="#" aria-label="Twitter"><svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>Copyright © 2026 Voureview. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
