import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Voureview | Leading Coupons & Deals Marketplace",
    template: "%s | Voureview"
  },
  description: "Leading Coupons & Deals Marketplace",
  keywords: ["coupons", "deals", "store reviews", "savings"],
  icons: {
    icon: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 768px) {
            .site-header .header-inner { flex-direction: row !important; flex-wrap: wrap !important; gap: 10px !important; justify-content: space-between !important; align-items: center !important; }
            .site-header .logo { margin-right: auto !important; width: 140px !important; }
            .site-header .site-nav { display: flex !important; order: 2 !important; width: auto !important; max-width: calc(100% - 150px) !important; padding-top: 0 !important; }
            .site-header .header-search-wrapper { order: 3 !important; flex: 1 1 100% !important; margin-top: 5px !important; width: 100% !important; }
            
            .coupon-items a { flex-direction: row !important; gap: 10px !important; text-align: left !important; padding: 10px 15px !important; align-items: center !important; justify-content: space-between !important; }
            .coupon-items .image { flex: 1 !important; width: auto !important; justify-content: flex-start !important; flex-direction: row !important; margin-right: 10px !important; text-align: left !important; gap: 10px !important; }
            .coupon-items .image img { width: 60px !important; height: 40px !important; margin-right: 0 !important; margin-bottom: 0 !important; }
            .coupon-items .image h3 { font-size: 0.95rem !important; margin: 0 !important; }
            .coupon-items .coupon { flex: unset !important; width: auto !important; text-align: right !important; }
            .coupon-items .cash-back { display: none !important; }
            .coupon-items .coupon-items-btn { display: none !important; }
            
            .sec-main-title h1 { font-size: 1.4rem !important; margin-bottom: 10px !important; line-height: 1.3 !important; }
            .sec-main-title h2 { font-size: 1rem !important; }
            
            .stores-az-list { gap: 4px !important; justify-content: center !important; padding: 10px !important; }
            .stores-az-link { padding: 4px 6px !important; font-size: 12px !important; border: none !important; border-radius: 4px !important; }
            .stores-az-link.active { background: rgba(255,255,255,0.2) !important; color: white !important; }
            .stores-az-bar { background: var(--accent) !important; box-shadow: 0 10px 25px rgba(50,88,179,0.15) !important; }
          }
        ` }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
