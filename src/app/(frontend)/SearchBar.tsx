"use client";

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface StoreResult {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface DealResult {
  _id: string;
  title: string;
  discountValue?: string;
  discountPrice?: string;
  type?: string;
  storeId?: { name: string; slug: string };
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState<StoreResult[]>([]);
  const [deals, setDeals] = useState<DealResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setStores([]);
      setDeals([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setStores(data.stores || []);
      setDeals(data.deals || []);
      setOpen(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(val), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = () => {
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = stores.length > 0 || deals.length > 0;

  return (
    <div ref={wrapperRef} className="search-bar-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for stores, categories or brands..."
          aria-label="Search"
          value={query}
          onChange={handleChange}
          onFocus={() => hasResults && setOpen(true)}
          autoComplete="off"
        />
        <button type="submit" aria-label="Go">
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </button>
      </form>

      {open && hasResults && (
        <div className="search-dropdown">
          {stores.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">Stores</div>
              {stores.map((store) => (
                <Link
                  key={store._id}
                  href={`/store/${store.slug}`}
                  className="search-result-item"
                  onClick={handleSelect}
                >
                  <div className="search-result-logo">
                    {store.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={store.image} alt={store.name} />
                    ) : (
                      <span>{store.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="search-result-info">
                    <strong>{store.name}</strong>
                    <span>View coupons & deals</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {deals.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">Deals</div>
              {deals.slice(0, 4).map((deal) => (
                <Link
                  key={deal._id}
                  href={deal.storeId ? `/store/${deal.storeId.slug}` : '/deals'}
                  className="search-result-item"
                  onClick={handleSelect}
                >
                  <div className="search-result-badge">
                    {deal.discountValue || deal.discountPrice || (deal.type === 'code' ? 'CODE' : 'DEAL')}
                  </div>
                  <div className="search-result-info">
                    <strong>{deal.title}</strong>
                    {deal.storeId && <span>{deal.storeId.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            className="search-view-all"
            onClick={handleSelect}
          >
            View all results for &ldquo;{query}&rdquo; →
          </Link>
        </div>
      )}

      {open && !hasResults && !loading && query.trim() && (
        <div className="search-dropdown">
          <div className="search-no-result">No results found for &ldquo;{query}&rdquo;</div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
