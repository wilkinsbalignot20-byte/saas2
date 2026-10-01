 'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ArrowUpRight, Store } from 'lucide-react';

interface NavLinkItem {
  label: string;
  ariaLabel?: string;
  href: string;
}

interface NavCardItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: NavLinkItem[];
}

interface CardNavProps {
  brandName?: string;
  logo?: string;
  logoAlt?: string;
  items: NavCardItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonLabel?: string;
  buttonHref?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const BAR_HEIGHT = 64;

export default function CardNav({
  brandName = 'KINS HUB',
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#fff',
  menuColor = '#1B211D',
  buttonLabel = 'Magbukas ng tindahan',
  buttonHref = '/',
  buttonBgColor = '#3E8F68',
  buttonTextColor = '#fff',
}: CardNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLDivElement | null;
      if (contentEl) return BAR_HEIGHT + contentEl.scrollHeight + 16;
    }
    return 280;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: BAR_HEIGHT });
    gsap.set(cardsRef.current, { y: 24, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.3, ease, stagger: 0.06 }, '-=0.15');
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsExpanded(true);
      tl.eventCallback('onReverseComplete', null);
      tl.play(0);
    } else {
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  const showImageLogo = Boolean(logo) && !logo!.includes('logo.svg');

  return (
    // Fixed-height slot: the nav floats over the page when expanded instead of pushing content down.
    <div className={`relative z-50 w-full ${className}`} style={{ height: BAR_HEIGHT }}>
      <nav
        ref={navRef}
        aria-label="Marketplace"
        className={`absolute inset-x-0 top-0 flex flex-col overflow-hidden rounded-2xl border transition-shadow duration-300 ${
          isExpanded ? 'border-[#1B211D]/10 shadow-xl' : 'border-[#1B211D]/8 shadow-sm'
        }`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="relative flex w-full items-center justify-between px-4 sm:px-6" style={{ height: BAR_HEIGHT }}>
          {/* Menu toggle */}
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isExpanded ? 'Isara ang menu' : 'Buksan ang menu'}
            aria-expanded={isExpanded}
            className="group flex h-10 items-center gap-3 rounded-lg pr-2 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3E8F68]"
            style={{ color: menuColor }}
          >
            <span className="flex h-8 w-8 flex-col items-center justify-center gap-1.5">
              <span className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isExpanded ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isExpanded ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isExpanded ? '-translate-y-2 -rotate-45' : ''}`} />
            </span>
            <span className="hidden text-sm font-semibold sm:inline">Browse</span>
          </button>

          {/* Brand, centered */}
          <Link href="/shop/explore" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2" aria-label={`${brandName} home`}>
            {showImageLogo ? (
              <img src={logo} alt={logoAlt} className="h-7 object-contain" />
            ) : (
              <>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B211D] text-white">
                  <Store size={16} strokeWidth={2.25} />
                </span>
                <span className="text-base font-extrabold tracking-tight text-[#1B211D]">{brandName}</span>
              </>
            )}
          </Link>

          {/* CTA */}
          <Link
            href={buttonHref}
            className="rounded-xl px-3.5 py-2 text-xs font-bold transition-[filter,transform] hover:brightness-95 active:scale-[0.97] sm:px-4 sm:text-sm"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          >
            <span className="sm:hidden">Magbenta</span>
            <span className="hidden sm:inline">{buttonLabel}</span>
          </Link>
        </div>

        {/* Expandable cards */}
        <div className="card-nav-content grid w-full grid-cols-1 gap-3 px-3 pb-3 md:grid-cols-3">
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              ref={setCardRef(idx)}
              className="flex min-h-[150px] flex-col gap-3 rounded-xl p-5"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="text-sm font-bold opacity-60">{item.label}</div>
              <div className="flex flex-1 flex-col justify-center gap-2">
                {item.links?.length ? (
                  item.links.map((lnk, i) => (
                    <Link
                      key={`${lnk.label}-${i}`}
                      href={lnk.href}
                      aria-label={lnk.ariaLabel}
                      className="flex items-center gap-1.5 text-sm font-semibold opacity-85 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                    >
                      <ArrowUpRight size={14} className="shrink-0 opacity-60" />
                      <span className="line-clamp-1">{lnk.label}</span>
                    </Link>
                  ))
                ) : (
                  <span className="text-sm opacity-60">Wala pang laman.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}