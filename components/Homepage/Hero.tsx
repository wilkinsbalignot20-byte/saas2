 // components/Homepage/Hero.tsx
"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import RotatingText from '@/components/Homepage/RotatingText';
import { ACTIVE_VIDEOS } from '@/constants/media';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      video.play().catch((error) => {
        console.log('Autoplay retry failed:', error);
      });
    };

    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo);
    }

    return () => video.removeEventListener('canplay', playVideo);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden bg-[#143d34]">
      {/* Video: buo ang linaw, walang blur o tint */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-[center_35%] z-0"
      >
        <source src={ACTIVE_VIDEOS.heroBackground} type="video/mp4" />
      </video>

      {/* Gradient sa ibabang bahagi lang (kung nasaan ang text), kaya
          malinaw pa rin ang video sa itaas at nababasa ang mga letra */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-3/5 z-10 bg-gradient-to-t from-[#0b2620]/85 via-[#0b2620]/40 to-transparent pointer-events-none"
      />

      <div className="w-full max-w-6xl mx-auto px-6 pt-32 pb-28 md:pb-36 relative z-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-marigold mb-4 uppercase tracking-wider">
            Built for Filipino merchants
          </p>

          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-6 flex flex-wrap items-center gap-x-3 text-white">
            <span>Every</span>
            <RotatingText
              texts={['tindahan', 'shop', 'boutique', 'negosyo']}
              mainClassName="bg-marigold text-black px-4 py-0.5 rounded-2xl overflow-hidden inline-flex shadow-lg"
              staggerDuration={0.025}
              splitBy="characters"
              rotationInterval={2500}
            />
            <span>deserves its own storefront</span>
          </h1>

          <p className="text-lg md:text-xl text-white/95 font-medium leading-relaxed max-w-xl mb-10">
            Manipu gives you a fully working online store in minutes — your own
            products, your own colors, your own customers. We handle the payments,
            shipping, and stock behind the scenes.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-marigold text-black font-bold px-8 py-4 rounded-full hover:bg-marigold/90 shadow-lg transition-all hover:-translate-y-0.5"
            >
              Start your store
            </Link>
            <Link
              href="/shop/explore"
              className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white transition-all"
            >
              Browse existing stores
            </Link>
          </div>

          <p className="text-sm text-white/80 mt-6">No credit card required to start.</p>
        </div>
      </div>
    </section>
  );
}