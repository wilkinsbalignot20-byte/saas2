'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './CardNav.css';

interface NavLink {
  label: string;
  ariaLabel?: string;
  href?: string;
}

interface NavItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: NavLink[];
}

interface CardNavProps {
  logo?: string | React.ReactNode;
  logoAlt?: string;
  items: NavItem[];
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ease?: string;
  theme?: 'light' | 'dark';
}

export const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  baseColor = '#fff',
  menuColor = '#000',
  buttonBgColor = '#111',
  buttonTextColor = '#fff',
  ease = 'power3.out',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      // Buksan ang navigation matrix window panel
      gsap.to(menuRef.current, {
        translateY: '0%',
        opacity: 1,
        duration: 0.5,
        ease: ease,
      });

      // Animate ang slide entries ng bawat group card layout deck
      if (cardsRef.current.length) {
        gsap.to(cardsRef.current.filter(Boolean), {
          translateY: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: ease,
          delay: 0.2,
        });
      }
    } else {
      // Isara ang navigation panel matrix at i-reset positions
      gsap.to(menuRef.current, {
        translateY: '-100%',
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      });

      if (cardsRef.current.length) {
        gsap.set(cardsRef.current.filter(Boolean), {
          translateY: 50,
          opacity: 0,
        });
      }
    }
  }, [isOpen, ease]);

  return (
    <nav
      className="card-nav"
      style={{
        // @ts-ignore
        '--base-color': baseColor,
        '--menu-color': menuColor,
        '--button-bg': buttonBgColor,
        '--button-text': buttonTextColor,
      }}
    >
      <div className="card-nav__bar">
        <div className="flex items-center">
          {typeof logo === 'string' ? (
            <img src={logo} alt={logoAlt} className="card-nav__logo" />
          ) : (
            logo || <span className="font-bold text-xl">Dashboard</span>
          )}
        </div>
        <button onClick={toggleMenu} className="card-nav__trigger">
          {isOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <div ref={menuRef} className="card-nav__menu">
        <div className="card-nav__cards">
          {items.map((item, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="card-nav__card"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <h3 className="card-nav__card-label">{item.label}</h3>
              <div className="card-nav__links">
                {item.links.map((link, lIndex) => (
                  <a
                    key={lIndex}
                    href={link.href || '#'}
                    aria-label={link.ariaLabel}
                    className="card-nav__link"
                    style={{ color: item.textColor }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CardNav;
