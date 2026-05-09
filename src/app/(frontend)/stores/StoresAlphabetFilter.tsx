"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  activeLetter: string;
}

const LETTERS = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

export default function StoresAlphabetFilter({ activeLetter }: Props) {
  const router = useRouter();

  return (
    <div className="stores-az-bar">
      <ul className="stores-az-list">
        {LETTERS.map((char) => (
          <li key={char}>
            <Link
              prefetch={false}
              href={char === 'All' ? '/stores' : `/stores?letter=${char}`}
              className={`stores-az-link${activeLetter === char ? ' active' : ''}`}
            >
              {char}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
