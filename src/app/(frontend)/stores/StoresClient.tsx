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

export default function StoresClient({ stores }: Props) {
  const [activeLetter, setActiveLetter] = useState('All');

  const filtered =
    activeLetter === 'All'
      ? stores
      : stores.filter((s) => {
          if (activeLetter === '#') return /^[^a-zA-Z]/.test(s.name);
          return s.name.toUpperCase().startsWith(activeLetter);
        });

  return (
    <>
      {/* A-Z Filter Bar */}
      <div className="stores-az-section container">
        <div className="stores-az-bar">
          <ul className="stores-az-list">
            {LETTERS.map((char) => (
              <li key={char}>
                <button
                  className={`stores-az-link${activeLetter === char ? ' active' : ''}`}
                  onClick={() => setActiveLetter(char)}
                >
                  {char}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Store Grid */}
      <div className="stores-grid-section container">
        {filtered.length === 0 ? (
          <div className="stores-empty">
            <p>No stores found for &ldquo;{activeLetter}&rdquo;. Try another letter.</p>
          </div>
        ) : (
          <div className="stores-grid">
            {filtered.map((store) => {
              const initial = (store.name || 'S').substring(0, 2).toUpperCase();
              return (
                <Link
                  prefetch={false}
                  key={store._id}
                  href={`/store/${store.slug}`}
                  className="store-grid-card"
                >
                  <div className="store-grid-logo">
                    <Image
                      src={store.image || `https://placehold.co/120x120/f1f1f1/333?text=${initial}`}
                      alt={store.name}
                      width={120}
                      height={120}
                      style={{ objectFit: 'contain' }}
                      unoptimized={!store.image}
                    />
                  </div>
                  <div className="store-grid-name">{store.name}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
