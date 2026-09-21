'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import './DepthCarousel.css';

interface CarouselItem {
  image: string;
  alt: string;
  [key: string]: any;
}

interface DepthCarouselProps {
  items: CarouselItem[];
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  autoplay?: boolean;
  loop?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  duration?: number;
  ease?: string;
  autoplayDelay?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

export const DepthCarousel: React.FC<DepthCarouselProps> = ({
  items,
  depth = 200,
  spread = 80,
  tilt = 15,
  tiltDirection = 'right',
  perspective = 1200,
  visibleCards = 3,
  falloff = 0.2,
  blur = 4,
  autoplay = false,
  loop = true,
  cardWidth = 300,
  cardHeight = 400,
  radius = 16,
  tint = '#000000',
  duration = 600,
  ease = 'power2.out',
  autoplayDelay = 3000,
  showControls = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const totalItems = items.length;

  const tiltSign = useMemo(() => (tiltDirection === 'right' ? 1 : -1), [tiltDirection]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1 % totalItems + totalItems) % totalItems);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  // Reset timers for autoplay features safely
  useEffect(() => {
    if (!autoplay) return;
    if (autoplayTimer.current) clearTimeout(autoplayTimer.current);

    autoplayTimer.current = setTimeout(() => {
      handleNext();
    }, autoplayDelay);

    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    };
  }, [activeIndex, autoplay, autoplayDelay]);

  // Main 3D Matrix Rendering Math
  useEffect(() => {
    if (!cardsRef.current.length) return;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      // Kalkulahin ang structural positioning relative sa gitna
      let offset = index - activeIndex;
      
      if (loop) {
        if (offset > totalItems / 2) offset -= totalItems;
        if (offset < -totalItems / 2) offset += totalItems;
      }

      const absOffset = Math.abs(offset);

      if (absOffset > visibleCards) {
        gsap.to(card, { opacity: 0, display: 'none', duration: 0.3 });
        return;
      }

      // 3D Spatial Vector Formulas
      const zTranslate = -absOffset * depth;
      const xTranslate = offset * spread;
      const rotationY = offset * tilt * tiltSign;
      const cardBlur = absOffset * blur;
      const cardOpacity = Math.max(0, 1 - absOffset * falloff);

      gsap.to(card, {
        display: 'block',
        opacity: cardOpacity,
        x: xTranslate,
        z: zTranslate,
        rotationY: rotationY,
        filter: `blur(${cardBlur}px)`,
        zIndex: totalItems - absOffset,
        duration: duration / 1000,
        ease: ease,
      });

      // Target overlay tint opacity
      const overlay = card.querySelector('.depth-carousel__overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: absOffset * 0.4,
          duration: duration / 1000,
          ease: ease,
        });
      }
    });
  }, [activeIndex, items, depth, spread, tilt, tiltSign, visibleCards, falloff, blur, loop, duration, ease]);

  return (
    <div
      ref={containerRef}
      className="depth-carousel"
      style={{
        // @ts-ignore
        '--perspective': `${perspective}px`,
        '--card-width': `${cardWidth}px`,
        '--card-height': `${cardHeight}px`,
        '--radius': `${radius}px`,
        '--tint': tint,
      }}
    >
      <div className="depth-carousel__stage">
        {items.map((item, index) => (
          <div
            key={index}
            ref={(el) => { cardsRef.current[index] = el; }}
            className="depth-carousel__card"
            onClick={() => setActiveIndex(index)}
          >
            <img src={item.image} alt={item.alt} className="depth-carousel__img" />
            <div className="depth-carousel__overlay" />
          </div>
        ))}
      </div>

      {showControls && (
        <div className="depth-carousel__controls">
          <button onClick={handlePrev} className="depth-carousel__btn">Prev</button>
          <button onClick={handleNext} className="depth-carousel__btn">Next</button>
        </div>
      )}
    </div>
  );
};

export default DepthCarousel;
