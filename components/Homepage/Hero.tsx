 // components/Homepage/Hero.tsx
"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import RotatingText from '@/components/RotatingText'; 
import { ACTIVE_VIDEOS } from '@/constants/media'; 

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 🚀 PINUPUWERSANG MAG-PLAY AT MAG-MUTE SA UNANG SILANG NG PAGE
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true; // Double check para payagan ng browser ang autoplay
      video.defaultMuted = true;
      
      const playVideo = () => {
        video.play().catch(error => {
          console.log("Autoplay retry failed:", error);
        });
      };

      // Patakbuhin agad o kapag handa na ang metadata ng video
      if (video.readyState >= 3) {
        playVideo();
      } else {
        video.addEventListener('canplay', playVideo);
      }

      return () => {
        video.removeEventListener('canplay', playVideo);
      };
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden bg-[#143d34]">
      
      {/* 📹 UPGRADED CLOUDINARY VIDEO BACKGROUND */}
      <video 
        ref={videoRef}
        autoPlay
        loop 
        muted 
        playsInline 
        controls={false}
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover object-[center_35%] z-0"
      >
        <source src={ACTIVE_VIDEOS.heroBackground} type="video/mp4" />
      </video>

      {/* 🧼 TINANGGAL ANG GRADIENT OVERLAY LAYER PARA LUMABAS ANG PURONG KULAY NG VIDEO */}

      {/* ✍️ ANG MGA LETTERS AT BUTTONS NA NASA IBABA - Itinaas sa z-20 */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-32 pb-24 md:pb-32 relative z-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-marigold mb-4 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Built for Filipino merchants
          </p>
          
          {/* INAYOS: Nilagyan ng mas malalim na shadow at banayad na dark outline para lumitaw ang pamagat */}
          <h1 
            className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-6 flex flex-wrap items-center gap-x-3 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.3)' }}
          >
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
          
          {/* INAYOS: Ginawang solid text-white at nilapatan ng high-contrast shadow para madaling basahin */}
          <p 
            className="text-lg md:text-xl text-white font-medium leading-relaxed max-w-xl mb-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            style={{ WebkitTextStroke: '0.2px rgba(0,0,0,0.2)' }}
          >
            Manipu gives you a fully working online store in minutes — your own products, your own colors, your own customers. We handle the payments, shipping, and stock behind the scenes.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-marigold text-black font-bold px-8 py-4 rounded-full hover:bg-marigold/90 shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Start your store
            </Link>
            <Link 
              href="/shop/explore" 
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm hover:bg-white/20 hover:border-white transition-all shadow-md"
            >
              Browse existing stores
            </Link>
          </div>
          
          <p className="text-sm text-paper/60 mt-6 italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            No credit card required to start.
          </p>
        </div>
      </div>

    </section>
  );
}
