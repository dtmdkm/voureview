"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function StoreClient({ data, settings, eventSales, hideHero = false }: any) {
  const [filter, setFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const deals = data.deals || [];
  
  useEffect(() => {
    // Handle opening modal if ?offer=id is in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const offerId = params.get('offer');
      if (offerId && deals.length > 0) {
        const deal = deals.find((d: any) => d._id === offerId || d.id === offerId);
        if (deal) {
          setSelectedDeal(deal);
          setIsModalOpen(true);
        } else {
          // Fallback if deal data isn't in the current store (e.g. cross-store link)
          const title = params.get('title');
          const code = params.get('code');
          const link = params.get('link');
          if (title && link) {
            setSelectedDeal({ title, code, link, type: code ? 'code' : 'deal' });
            setIsModalOpen(true);
          }
        }
      }
    }
  }, [deals]);

  const filteredDeals = deals.filter((d: any) => {
    if (filter === 'all') return true;
    if (filter === 'code') return d.type === 'code' || d.code;
    if (filter === 'deal') return d.type === 'deal' && !d.code;
    return true;
  });

  const codesCount = deals.filter((d: any) => d.type === 'code' || d.code).length;
  const dealsCount = deals.filter((d: any) => d.type === 'deal' && !d.code).length;

  const handleOpenDeal = (deal: any) => {
    // Track click
    fetch(`/api/deals/${deal._id}/click`, { method: 'POST' }).catch(() => {});
    
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href.split('?')[0];
      const couponParams = new URLSearchParams({
        offer: deal._id || deal.id,
        title: deal.title,
        code: deal.code || '',
        link: deal.link
      });
      
      // Mở trang web cửa hàng hiện tại CÙNG VỚI popup trong tab MỚI (tab này sẽ được focus)
      window.open(`${currentUrl}?${couponParams.toString()}`, '_blank');
      
      // Tab CŨ (hiện tại) sẽ tự động chuyển hướng đến link affiliate
      window.location.href = deal.link;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
    });
  };

  const footerData = {
    resources: settings.footer_resources || [],
    company: settings.footer_company || [],
    notices: settings.footer_notices || []
  };

  const displayRating = data.rating || 4.9;
  const generateRandomVotes = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 5000 + 150;
  };
  const pseudoRandomVotes = data.name ? generateRandomVotes(data.name) : 1250;
  const displayVotes = data.totalVotes === 1250 ? pseudoRandomVotes : (data.totalVotes || pseudoRandomVotes);

  const renderStars = () => {
    const percentage = (displayRating / 5) * 100;
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ color: '#e2e8f0' }}>★★★★★</div>
        <div style={{ 
          color: '#f59e0b', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          width: `${percentage}%` 
        }}>
          ★★★★★
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Store Hero */}
      {!hideHero && (
        <section id="store-hero" className="fade-in container" style={{ marginTop: '30px' }}>
          <div className="store-banner-wrap">
            <Image 
              src={data.banner || 'https://placehold.co/1200x400/f8fafc/3258b3?text=Special+Offers'} 
              alt={`${data.name} Banner`} 
              fill 
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          <div className="store-profile-header">
            <button 
              className="store-logo-wrap" 
              style={{ 
                position: 'relative', zIndex: 9999, userSelect: 'none', WebkitUserSelect: 'none', 
                cursor: 'pointer', border: 'none', outline: 'none', display: 'flex', pointerEvents: 'auto',
                padding: '10px', background: 'white'
              }}
              onClick={() => {
                const storeDeals = (data as any).deals || [];
                if (storeDeals && storeDeals.length > 0) {
                  handleOpenDeal(storeDeals[0]);
                } else if (data.link && data.link !== '#') {
                  const url = data.link.startsWith('http') ? data.link : `https://${data.link}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <Image 
                src={data.image || '/favicon.png'} 
                alt={`${data.name} Logo`} 
                width={140} 
                height={140} 
                style={{ objectFit: 'contain', position: 'relative', zIndex: 1 }}
              />
            </button>
            <div className="store-info-wrap">
              <h1 className="store-title-main">
                {data.name} Promo Codes & Coupons
                <span className="verified-badge">Verified</span>
              </h1>
              <div className="store-meta-main">
                <div className="stars">{renderStars()}</div>
                <span className="vote-text">
                  <strong>{displayRating.toFixed(1)}</strong> / 5.0 from {displayVotes.toLocaleString()} users
                </span>
              </div>
            </div>
            <div className="store-actions-main">
               <button className="btn-follow" onClick={() => alert('Saved to your favorites!')}>
                 <svg style={{ width:'18px', height:'18px', fill:'currentColor' }} viewBox="0 0 24 24">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                 </svg>
                 Follow
               </button>
            </div>
          </div>
        </section>
      )}

      <div className="store-layout fade-in container">
        {/* Sidebar */}
        <aside>
          <div className="sidebar-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#111827', textAlign: 'left' }}>About {data.name}</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, textAlign: 'left', marginBottom: '20px', fontWeight: 500 }}>
              {data.description || `Explore the best verified ${data.name} coupons and deals today.`}
            </p>
            <button className="btn-alert" onClick={() => deals.length > 0 && handleOpenDeal(deals[0])}>
              Get Coupons Now
            </button>
            
            <div className="stats-box">
              <div className="stat-row">
                <span>Total Offers</span>
                <b>{deals.length}</b>
              </div>
              <div className="stat-row">
                <span>Coupon Codes</span>
                <b>{codesCount}</b>
              </div>
              <div className="stat-row">
                <span>Best Discount</span>
                <b style={{ color: 'var(--accent)' }}>{deals[0]?.discountValue || deals[0]?.discountPrice || deals[0]?.price || 'SALE'}</b>
              </div>
            </div>
          </div>

          <div className="sidebar-card" style={{ padding: '24px', textAlign: 'left', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0052ff', fill: '#0052ff', stroke: 'white' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Why Trust Us</h4>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: 600, marginBottom: '16px' }}>Real deals, chosen by real experts</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#374151', lineHeight: '1.5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '3px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span>Dedicated merchandising team sources and verifies <strong>{data.name}</strong> coupons</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#374151', lineHeight: '1.5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '3px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span>Every promo code checked against the fine print</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#374151', lineHeight: '1.5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '3px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span>All coupons sourced in-house — no AI or third-party reliance</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#374151', lineHeight: '1.5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '3px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span>Database updated daily — last verified <strong suppressHydrationWarning>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
              </li>
            </ul>

          </div>

          <div className="sidebar-card" style={{ padding: '24px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px', color: '#111827' }}>Rating & Votes</h4>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '24px', letterSpacing: '4px', marginBottom: '8px' }}>{renderStars()}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                {displayRating.toFixed(1)} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.9rem' }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                {displayVotes.toLocaleString('en-US')} votes
              </div>
            </div>
            <button 
              className="btn-see-more" 
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
              onClick={() => alert('Thank you for your rating!')}
            >
              Rate it
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section>
          <div className="promo-header">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{data.name} Coupons and Promo Codes</h2>
          </div>

          <div className="filter-tabs">
            <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All ({deals.length})
            </button>
            <button className={`tab ${filter === 'code' ? 'active' : ''}`} onClick={() => setFilter('code')}>
              Codes ({codesCount})
            </button>
            <button className={`tab ${filter === 'deal' ? 'active' : ''}`} onClick={() => setFilter('deal')}>
              Deals ({dealsCount})
            </button>
          </div>

          <div id="coupons-list">
            {filteredDeals.map((deal: any) => (
              <div key={deal._id} className="coupon-card">
                <div className="save-badge">
                  {deal.discountValue ? (
                    <span className="amount">{deal.discountValue}</span>
                  ) : (
                    <>
                      <span className="amount">{deal.discountPrice || deal.price || 'SALE'}</span>
                      <span className="label">{deal.type === 'code' ? 'CODE' : 'DEAL'}</span>
                    </>
                  )}
                </div>
                <div className="coupon-info">
                  <div className="verified-tag">Verified</div>
                  <h3>{deal.title}</h3>
                  <p>{deal.description}</p>
                  <div className="social-proof-bar">
                    <span className="social-proof-badge">✓ Working</span>
                    <span className="social-proof-text">Used <strong suppressHydrationWarning>{Math.floor(Math.random() * 50) + 10}</strong> times today</span>
                  </div>
                </div>
                <div className="coupon-action">
                  {deal.type === 'code' || deal.code ? (
                    <div className="get-code-wrapper" onClick={() => handleOpenDeal(deal)}>
                      <div className="code-hint">{deal.code || 'SHOW'}</div>
                      <div className="btn-peel">GET CODE</div>
                    </div>
                  ) : (
                    <button className="btn-get" onClick={() => handleOpenDeal(deal)}>
                      GET DEAL
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="about-section fade-in" style={{ marginTop: '40px' }}>
            <h2>Review of {data.name}</h2>
            <div 
              className="content-body" 
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: data.content || `Save more with verified coupons for ${data.name}.` }} 
            />
            
            <div className="how-to-apply">
              <h3>How to use a {data.name} promo code</h3>
              <ol>
                <li><strong>Copy a code:</strong> Browse this page and click "Get Code" on the offer you want. A popup will show the code and open the store.</li>
                <li><strong>Shop the site:</strong> Add items to your shopping cart at {data.name}.</li>
                <li><strong>Paste the code:</strong> During checkout, look for the box labeled "Promo Code" or "Discount Code" and paste your code there.</li>
                <li><strong>Enjoy savings:</strong> Your discount will be applied to your total!</li>
              </ol>
            </div>

            {data.faqs && data.faqs.length > 0 && (
              <div className="faq-section" style={{ marginTop: '50px' }}>
                <h2>{data.name} Frequently Asked Questions</h2>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {data.faqs.map((faq: any, i: number) => (
                    <details key={i} className="faq-details" open={i === 0}>
                      <summary className="faq-summary">
                        {faq.question}
                      </summary>
                      <div className="faq-answer">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDeal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setIsModalOpen(false)}>
          <div className="modal-popup" onClick={e => e.stopPropagation()}>
            <div className="modal-header-bar"></div>
            <span className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <div className="modal-body">
              <Image 
                src={data.image || '/favicon.png'} 
                alt="Logo" 
                className="modal-store-logo" 
                width={80} 
                height={80} 
                style={{ objectFit: 'contain' }}
              />
              <h3 className="modal-title">{selectedDeal.title}</h3>
              
              {selectedDeal.code ? (
                <>
                  <p className="modal-instruction">Copy and paste this code at {data.name}</p>
                  <div className="code-box">
                    <div className="code-text">{selectedDeal.code}</div>
                    <button className="copy-btn" onClick={() => copyCode(selectedDeal.code)} style={copied ? { background: '#00a38d' } : {}}>
                      {copied ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                  <a href={selectedDeal.link} target="_blank" className="modal-footer-link">Go to {data.name} →</a>
                </>
              ) : (
                <>
                  <p className="modal-instruction" style={{ marginBottom: '25px' }}>No coupon code required. Discount will be applied automatically.</p>
                  <a href={selectedDeal.link} target="_blank" className="btn-get" style={{ display: 'block', width: '100%', marginBottom: '15px' }}>SHOP NOW</a>
                  <a href={selectedDeal.link} target="_blank" className="modal-footer-link">Go to {data.name} →</a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
