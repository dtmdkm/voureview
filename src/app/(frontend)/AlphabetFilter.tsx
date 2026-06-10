"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const LETTERS = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

interface Store {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Props {
  stores: Store[];
}

export default function AlphabetFilter({ stores }: Props) {
  const [activeLetter, setActiveLetter] = useState('All');

  const formatDiscount = (val: any) => {
    if (!val) return 'Verified Deal';
    if (typeof val === 'string' && val.match(/^\$(\d{3,})$/)) {
      const numStr = val.substring(1);
      return `$${numStr.slice(0, -2)}.${numStr.slice(-2)}`;
    }
    return val;
  };

  const filtered = activeLetter === 'All'
    ? stores.slice(0, 10)
    : stores.filter((s) => {
        const name = s.name || '';
        if (activeLetter === '#') return /^[^a-zA-Z]/.test(name);
        return name.toUpperCase().startsWith(activeLetter);
      }).slice(0, 10);

  return (
    <div className="coupon-stores-main">
      <ul id="alphabet-list" className="list-filters">
        {LETTERS.map((char) => (
          <li key={char} className={activeLetter === char ? 'active' : ''}>
            <button
              className="alphabet-link"
              onClick={() => setActiveLetter(char)}
            >
              {char}
            </button>
          </li>
        ))}
      </ul>

      <ul id="store-list" className="coupon-items-main">
        {filtered.length === 0 ? (
          <li style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
            No stores found for &ldquo;{activeLetter}&rdquo;
          </li>
        ) : (
          filtered.map((store, idx) => {
            const initial = (store.name || 'S').substring(0, 2).toUpperCase();
            const imgSrc = store.image || `https://placehold.co/100x60/f1f1f1/3258b3?text=${initial}`;
            return (
              <li key={store._id} className="coupon-items">
                <Link prefetch={false} href={`/store/${store.slug}`}>
                  <div className="image">
                    <Image
                      src={imgSrc}
                      alt={store.name}
                      width={90}
                      height={60}
                      style={{ objectFit: 'contain' }}
                      unoptimized={!store.image}
                    />
                    <h3>{store.name}</h3>
                  </div>
                  <div className="coupon">
                    <div className="coupon-count">{(store as any).dealCount || 0} {((store as any).dealCount || 0) > 1 ? 'Coupons' : 'Coupon'}</div>
                  </div>
                  <div className="cash-back">
                    <span>{formatDiscount((store as any).bestDiscount)}</span>
                  </div>
                  <div className="coupon-items-btn">
                    <span>Shop &amp; Save</span>
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>

    </div>
  );
}
