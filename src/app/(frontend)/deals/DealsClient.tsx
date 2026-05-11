"use client";

import Link from 'next/link';
import { useState } from 'react';

type Filter = 'all' | 'code' | 'deal';

export default function DealsClient({ deals }: { deals: any[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = deals.filter((d) => {
    if (filter === 'code') return d.type === 'code' || d.code;
    if (filter === 'deal') return d.type === 'deal' && !d.code;
    return true;
  });

  const codeCount = deals.filter((d) => d.type === 'code' || d.code).length;
  const dealCount = deals.filter((d) => d.type === 'deal' && !d.code).length;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      {/* Breadcrumb */}
      <nav className="breadcrumb-nav" style={{ marginBottom: '28px' }}>
        <Link href="/">Home</Link>
        <span> › </span>
        <span>All Deals</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '8px' }}>
          Latest Deals & Coupons
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
          {deals.length} deals from verified stores — updated daily
        </p>
      </div>

      {/* Filter tabs */}
      <div className="deals-filter-bar">
        <button
          className={`deals-filter-btn${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All <span className="deals-filter-count">{deals.length}</span>
        </button>
        <button
          className={`deals-filter-btn${filter === 'code' ? ' active' : ''}`}
          onClick={() => setFilter('code')}
        >
          Coupon Codes <span className="deals-filter-count">{codeCount}</span>
        </button>
        <button
          className={`deals-filter-btn${filter === 'deal' ? ' active' : ''}`}
          onClick={() => setFilter('deal')}
        >
          Deals <span className="deals-filter-count">{dealCount}</span>
        </button>
      </div>

      {/* Deal list */}
      <div className="deals-list" style={{ marginTop: '24px' }}>
        {filtered.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 0' }}>
            No deals found.
          </p>
        )}

        {filtered.map((deal, index) => {
          const storeLogo = deal.storeId?.image;
          const storeName = deal.storeId?.name || '';
          const storeSlug = deal.storeId?.slug;
          const discount = deal.discountValue || deal.discountPrice || deal.price || 'SALE';
          const discountLabel = deal.type === 'code' ? 'CODE' : 'OFF';

          return (
            <div
              key={deal._id}
              className="coupon-card fade-in"
              style={{ animationDelay: `${Math.min(index, 10) * 0.05}s` }}
            >
              {/* Left: store logo + discount */}
              <div className="deal-left">
                <div className="deal-logo">
                  {storeLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={storeLogo} alt={storeName} />
                  ) : (
                    <span className="deal-logo-placeholder">
                      {storeName.substring(0, 2).toUpperCase() || 'ST'}
                    </span>
                  )}
                </div>
                <div className="deal-discount">
                  <span className="amount">{discount}</span>
                  <span className="label">{discountLabel}</span>
                </div>
              </div>

              {/* Middle: info */}
              <div className="coupon-info">
                {deal.isVerified && <div className="verified-tag">Verified</div>}
                <h3>
                  {storeSlug ? (
                    <Link
                      href={`/store/${storeSlug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {deal.title}
                    </Link>
                  ) : (
                    deal.title
                  )}
                </h3>
                {deal.description && (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.5 }}>
                    {deal.description}
                  </p>
                )}
                {storeSlug && (
                  <Link href={`/store/${storeSlug}`} className="deal-store-link" style={{ marginTop: '6px' }}>
                    {storeName}
                  </Link>
                )}
              </div>

              {/* Right: action */}
              <div className="coupon-action">
                {deal.code ? (
                  <div style={{ width: '100%' }}>
                    <div className="get-code-wrapper" onClick={() => handleCopy(deal.code, deal._id)}>
                      <div className="code-hint">{deal.code}</div>
                      <div className="btn-peel">
                        {copied === deal._id ? '✓ Copied!' : 'Show Code'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={deal.link || (storeSlug ? `/store/${storeSlug}` : '#')}
                    className="btn-get"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get this Deal
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
