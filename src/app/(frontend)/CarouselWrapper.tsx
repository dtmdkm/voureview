"use client";

import React, { useRef } from 'react';

interface CarouselWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function CarouselWrapper({ 
  children, 
  title,
  className = "cash-back-sec container" 
}: CarouselWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scrollSlider = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={className}>
      {title && (
        <div className="sec-title">
          <h2>{title}</h2>
        </div>
      )}
      <div className="slider-container">
        <button className="slider-nav prev" onClick={() => scrollSlider('left')} aria-label="Previous">&lsaquo;</button>
        <div className="swiper-wrapper custom-scroll-snap" ref={scrollRef}>
          {children}
        </div>
        <button className="slider-nav next" onClick={() => scrollSlider('right')} aria-label="Next">&rsaquo;</button>
      </div>
    </section>
  );
}
