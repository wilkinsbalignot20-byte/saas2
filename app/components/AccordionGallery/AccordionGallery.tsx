'use client';

import React, { useState } from 'react';
import './AccordionGallery.css';

interface GalleryItem {
  image: string;
  label?: string;
  alt?: string;
  link?: string;
}

interface AccordionGalleryProps {
  items: GalleryItem[];
  defaultIndex?: number;
  trigger?: 'hover' | 'click';
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  overlayColor?: string;
  textColor?: string;
  ease?: string;
}

export const AccordionGallery: React.FC<AccordionGalleryProps> = ({
  items,
  defaultIndex = 0,
  trigger = 'hover',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  overlayColor = '#060010',
  textColor = '#ffffff',
  ease = 'cubic-bezier(0.25, 1, 0.5, 1)',
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number>(defaultIndex);

  const handleInteraction = (index: number) => {
    setExpandedIndex(index);
  };

  return (
    <div
      className={`accordion-gallery ${orientation === 'vertical' ? 'accordion-gallery--vertical' : ''}`}
      style={{
        // @ts-ignore
        '--height': `${height}px`,
        '--gap': `${gap}px`,
        '--radius': `${radius}px`,
        '--expand-flex': items.length * expandRatio,
        '--overlay-color': overlayColor,
        '--text-color': textColor,
        '--ease': ease,
      }}
    >
      {items.map((item, index) => {
        const isExpanded = index === expandedIndex;

        return (
          <div
            key={index}
            className={`accordion-gallery__panel ${isExpanded ? 'is-expanded' : ''} ${
              orientation === 'vertical' ? 'accordion-gallery__panel--vertical' : ''
            }`}
            onMouseEnter={trigger === 'hover' ? () => handleInteraction(index) : undefined}
            onClick={trigger === 'click' ? () => handleInteraction(index) : undefined}
          >
            <img
              src={item.image}
              alt={item.alt || item.label || 'Gallery Image'}
              className="accordion-gallery__img"
            />
            <div className="accordion-gallery__overlay" />
            
            {item.label && (
              <div className="accordion-gallery__caption">
                <h3 className="font-display font-bold text-lg">{item.label}</h3>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
