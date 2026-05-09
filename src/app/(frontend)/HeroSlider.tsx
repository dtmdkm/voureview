"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSlider({ banners }: { banners: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: activeIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  // Handle window resize to keep current slide in view
  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        const slideWidth = sliderRef.current.offsetWidth;
        sliderRef.current.scrollTo({
          left: activeIndex * slideWidth,
          behavior: 'auto'
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex]);

  if (!banners || banners.length === 0) return null;

  return (
    <div 
      className="banner-slider-wrapper relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="banner-slider" 
        ref={sliderRef}
        style={{ scrollSnapType: 'x mandatory', overflowX: 'hidden' }}
      >
        {banners.map((banner: any, i: number) => (
          <div key={i} className="banner-slide relative" style={{ backgroundColor: banner.bg }}>
            {banner.image && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            )}
            <div className="banner-ctn container relative z-10">
              <div className="banner-title drop-shadow-lg text-white">{banner.title}</div>
              <Link prefetch={false} href={banner.link || "/deals"} className="banner-link shadow-lg">
                {banner.desc}
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots/Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i 
                  ? "bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                  : "bg-white/40 w-2 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows (Visible on hover) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={() => setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button 
            onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </>
      )}
    </div>
  );
}
