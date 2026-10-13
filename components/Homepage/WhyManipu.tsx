 // components/Homepage/WhyManipu.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import FloatingStats from './FloatingStats';

// COMPONENT PARA SA KUSANG GUMAGALAW NA NUMERO
function RunningNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    return prefix + Math.round(latest).toLocaleString('en-PH') + suffix;
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 2,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, motionValue]);

  return <motion.span suppressHydrationWarning>{rounded}</motion.span>;
}

const MONTHS = [
  { m: 'May', h: 28 },
  { m: 'Jun', h: 38 },
  { m: 'Jul', h: 34 },
  { m: 'Aug', h: 52 },
  { m: 'Sep', h: 66 },
  { m: 'Oct', h: 92 },
];

export default function WhyManipu() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  const [isMounted, setIsMounted] = useState(false);
  const [liveData, setLiveData] = useState({
    visitors: 2400,
    cart: 640,
    paid: 180,
    sales: 62900,
    orders: 428
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🚀 LIVE STREAM EFFECT: Unti-unting nadadagdagan ang data habang tumatagal sa page
  useEffect(() => {
    if (!inView || !isMounted) return;
    const interval = setInterval(() => {
      const addedVisitors = 1 + Math.floor(Math.random() * 2);
      const addedCart = Math.random() > 0.4 ? 1 : 0;
      const addedPaid = addedCart && Math.random() > 0.6 ? 1 : 0;
      
      setLiveData(prev => ({
        visitors: prev.visitors + addedVisitors,
        cart: prev.cart + addedCart,
        paid: prev.paid + addedPaid,
        orders: prev.orders + addedPaid,
        sales: prev.sales + (addedPaid * (350 + Math.floor(Math.random() * 450)))
      }));
    }, 3500);

    return () => clearInterval(interval);
  }, [inView, isMounted]);

  // Kalkulasyon ng actual animation targets kapag nasa viewport na
  const animatedVisitors = isMounted && inView ? liveData.visitors : 0;
  const animatedCart = isMounted && inView ? liveData.cart : 0;
  const animatedPaid = isMounted && inView ? liveData.paid : 0;
  const animatedSales = isMounted && inView ? liveData.sales : 0;
  const animatedOrders = isMounted && inView ? liveData.orders : 0;

  return (
    <section
      ref={sectionRef}
      id="why-manipu"
      className="relative z-10 -mt-10 rounded-t-[2.5rem] bg-paper"
    >
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <FloatingStats />

        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-ink mb-4">
            The easier way to run an online tindahan
          </h2>
          <p className="text-ink/60 leading-relaxed">
            Mula sa unang bisita hanggang sa bayad at padala, nasa isang lugar
            na ang lahat ng kailangan ng negosyo mo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* CARD 1: Funnel (Live Increments) */}
          <article className="bg-white rounded-3xl border border-ink/10 p-4 shadow-sm flex flex-col">
            <div
              className="rounded-2xl bg-[#143d34] p-5 h-56 flex flex-col justify-center gap-3"
              role="img"
              aria-label="Live Funnel Metrics"
            >
              {/* Visitor row */}
              <div className="w-full mx-auto">
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-white">
                  <span className="text-xs text-white/70">Bumisita sa store</span>
                  <span className="font-display font-bold text-sm">
                    <RunningNumber value={animatedVisitors} />
                  </span>
                </div>
              </div>
              {/* Add to cart row */}
              <div className="w-4/5 mx-auto">
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-white">
                  <span className="text-xs text-white/70">Nag-add to cart</span>
                  <span className="font-display font-bold text-sm">
                    <RunningNumber value={animatedCart} />
                  </span>
                </div>
              </div>
              {/* Paid row */}
              <div className="w-3/5 mx-auto">
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-white">
                  <span className="text-xs text-white/70">Nagbayad</span>
                  <span className="font-display font-bold text-sm">
                    <RunningNumber value={animatedPaid} />
                  </span>
                </div>
              </div>
            </div>
            <div className="px-3 pt-6 pb-3">
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                Abutin ang mas maraming mamimili
              </h3>
              <p className="text-sm text-ink/60 leading-relaxed">
                Ilagay ang store link mo sa Facebook, TikTok, at Messenger.
                Makakapag-browse, add to cart, at checkout ang customer sa iisang page.
              </p>
            </div>
          </article>

          {/* CARD 2: Stat tiles (Smooth Count-up) */}
          <article className="bg-white rounded-3xl border border-ink/10 p-4 shadow-sm flex flex-col">
            <div
              className="rounded-2xl bg-[#143d34] p-5 h-56 flex flex-col justify-center gap-3"
              role="img"
              aria-label="Live Sales Records"
            >
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white">
                <p className="text-xs text-white/70 mb-1">Benta ngayong buwan</p>
                <div className="flex items-end justify-between">
                  <p className="font-display font-bold text-3xl">
                    <RunningNumber value={animatedSales} prefix="₱" />
                  </p>
                  <span className="text-xs font-semibold text-marigold">+12%</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white">
                <p className="text-xs text-white/70 mb-1">Mga order</p>
                <div className="flex items-end justify-between">
                  <p className="font-display font-bold text-3xl">
                    <RunningNumber value={animatedOrders} />
                  </p>
                  <span className="text-xs font-semibold text-marigold">+8%</span>
                </div>
              </div>
            </div>
            <div className="px-3 pt-6 pb-3">
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                Siguradong tama ang bawat order
              </h3>
              <p className="text-sm text-ink/60 leading-relaxed">
                Awtomatikong nababawasan ang stock sa bawat benta, kaya hindi ka
                mao-oversell. Makikita mo ang order mula pending hanggang delivered.
              </p>
            </div>
          </article>

          {/* CARD 3: Bar chart (Infinite Growing Loop) */}
          <article className="bg-white rounded-3xl border border-ink/10 p-4 shadow-sm flex flex-col">
            <div
              className="rounded-2xl bg-[#143d34] p-5 h-56 flex flex-col"
              role="img"
              aria-label="Infinite Growing Monthly Sales Graph"
            >
              <p className="text-xs text-white/70 mb-3">Benta kada buwan</p>
              <div className="flex-1 flex items-end gap-3 h-32">
                {MONTHS.map((b, i) => {
                  const last = i === MONTHS.length - 1;
                  return (
                    <div key={b.m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      {/* Ginamitan ng motion.div para sa wave entrance at infinite pulsing effect sa huling buwan */}
                      <motion.div
                        className={`w-full rounded-t-md ${last ? 'bg-marigold' : 'bg-white/20'}`}
                        initial={{ height: 0 }}
                        animate={
                          inView && isMounted
                            ? last
                              ? { height: ['92%', '96%', '92%'] } // Infinite grow pulsation effect for active month
                              : { height: `${b.h}%` }
                            : { height: 0 }
                        }
                        transition={
                          last && inView && isMounted
                            ? {
                                height: {
                                  repeat: Infinity,
                                  duration: 2.5,
                                  ease: 'easeInOut',
                                },
                              }
                            : { duration: 1.2, ease: 'easeOut', delay: i * 0.15 }
                        }
                      />
                      <span className={`text-[10px] ${last ? 'text-marigold font-semibold' : 'text-white/60'}`}>
                        {b.m}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-3 pt-6 pb-3">
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                Lumago sa sarili mong bilis
              </h3>
              <p className="text-sm text-ink/60 leading-relaxed">
                Alamin kung ano ang mabenta at sino ang bumibili. Kami na ang bahala
                sa payments, shipping labels, at payouts.
              </p>
            </div>
          </article>
        </div>

        <p className="text-xs text-ink/40 text-center mt-6">
          Sample data para ipakita ang dashboard. Live session metrics active.
        </p>

        <div className="flex justify-center mt-10">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-3 rounded-full bg-[#143d34] pl-8 pr-2 py-2 font-semibold text-white transition-colors hover:bg-[#0f2e27] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marigold"
          >
            Start your store
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#143d34] transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={18} strokeWidth={2} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
