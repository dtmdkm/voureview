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

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const setting = await Setting.findOne({ key: 'site_meta_verify' }).lean();
  const other: Record<string, string> = {};
  
  if (setting && setting.value) {
    const tags = setting.value.split('>');
    const nameRegex = /(?:name|property)=['"]([^'"]+)['"]/i;
    const contentRegex = /content=['"]([^'"]+)['"]/i;
    for (const tag of tags) {
      if (tag.toLowerCase().includes('<meta')) {
        const nameMatch = tag.match(nameRegex);
        const contentMatch = tag.match(contentRegex);
        if (nameMatch && contentMatch) {
          other[nameMatch[1]] = contentMatch[1];
        }
      }
    }
  }

  return {
    title: 'Voureview | Leading Coupons & Deals Marketplace',
    description: 'Leading Coupons & Deals Marketplace',
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
    other: Object.keys(other).length > 0 ? other : undefined,
  };
}

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
          <div className="container header-inner mobile-header-fix">
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
                  <a href="https://www.facebook.com/VouReview/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href="https://x.com/VouReview" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                    <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                  </a>
                  <a href="https://www.instagram.com/vou.review/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://www.youtube.com/@VouReview" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
                  </a>
                  <a href="https://www.tiktok.com/@voureview" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>
                  </a>
                  <a href="https://www.pinterest.com/voureview/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                    <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.377-.293 1.194-.332 1.355-.052.215-.173.261-.399.157-1.492-.695-2.424-2.876-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.373 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.445-1.585 3.295a12.03 12.03 0 0 0 3.674.573c6.62 0 11.988-5.367 11.988-11.987C24.004 5.367 18.637 0 12.017 0z"></path></svg>
                  </a>
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
