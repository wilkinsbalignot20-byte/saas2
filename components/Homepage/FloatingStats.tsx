 // components/Homepage/FloatingStats.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Banknote, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const BASE = { sales: 48250, orders: 1284, customers: 326, conversion: 3.8 };

// COMPONENT PARA SA KUSANG GUMAGALAW NA NUMERO
function AnimatedNumber({ value, isCurrency = false, isPercentage = false }: { value: number; isCurrency?: boolean; isPercentage?: boolean }) {
  const motionValue = useMotionValue(0);
  
  const rounded = useTransform(motionValue, (latest) => {
    if (isPercentage) {
      return latest.toFixed(1) + '%';
    }
    const formatted = Math.round(latest).toLocaleString('en-PH');
    return isCurrency ? '₱' + formatted : formatted;
  });

  useEffect(() => {
    // Unti-unting papalakihin ang numero patungo sa "value" sa loob ng 2 segundo
    const controls = animate(motionValue, value, {
      duration: 2,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, motionValue]);

  return <motion.span suppressHydrationWarning>{rounded}</motion.span>;
}

function Sparkline({ points }: { points: number[] }) {
  const w = 120;
  const h = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / (max - min || 1)) * (h - 6) - 3;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" aria-hidden="true">
      <motion.path
        d={d}
        fill="none"
        stroke="#143d34"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      />
    </svg>
  );
}

type CardProps = {
  icon: React.ReactNode;
  label: string;
  rawValue: number; 
  isCurrency?: boolean;
  isPercentage?: boolean;
  delta: string;
  points: number[];
  offset: string;
  floatDelay: number;
  inView: boolean;
};

function StatCard({ icon, label, rawValue, isCurrency, isPercentage, delta, points, offset, floatDelay, inView }: CardProps) {
  return (
    <motion.div
      className={offset}
      animate={{ y: [0, -8, 0] }} // Laging lulutang nang banayad ang card
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
    >
      <div className="rounded-2xl bg-white border border-ink/10 p-5 shadow-[0_12px_32px_-12px_rgba(20,61,52,0.25)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#143d34] text-marigold">
              {icon}
            </span>
            <span className="text-sm text-ink/60">{label}</span>
          </div>
          <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">
            {delta}
          </span>
        </div>
        <p className="font-display font-bold text-3xl text-ink tabular-nums mb-2">
          {inView ? (
            <AnimatedNumber value={rawValue} isCurrency={isCurrency} isPercentage={isPercentage} />
          ) : (
            isCurrency ? '₱0' : (isPercentage ? '0.0%' : '0')
          )}
        </p>
        <Sparkline points={points} />
      </div>
    </motion.div>
  );
}

export default function FloatingStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [isMounted, setIsMounted] = useState(false);
  const [extra, setExtra] = useState({ sales: 0, orders: 0, customers: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Kusa at unti-unting magdadagdag ng numero tuwing may "bagong order"
  useEffect(() => {
    if (!inView || !isMounted) return;
    const id = setInterval(() => {
      const newOrders = 1 + Math.floor(Math.random() * 3);
      setExtra((e) => ({
        orders: e.orders + newOrders,
        sales: e.sales + newOrders * (250 + Math.floor(Math.random() * 650)),
        customers: e.customers + (Math.random() > 0.6 ? 1 : 0),
      }));
    }, 4000); 
    return () => clearInterval(id);
  }, [inView, isMounted]);

  // Kalkulasyon ng kasalukuyang mga numero
  const currentSales = isMounted && inView ? BASE.sales + extra.sales : 0;
  const currentOrders = isMounted && inView ? BASE.orders + extra.orders : 0;
  const currentCustomers = isMounted && inView ? BASE.customers + extra.customers : 0;
  const currentConversion = isMounted && inView ? BASE.conversion : 0;

  return (
    <div ref={ref} className="mb-20">
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
        </span>
        <p className="text-sm text-ink/60">Ganito kumilos ang isang aktibong tindahan sa Manipu</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Banknote size={16} />}
          label="Benta ngayong araw"
          rawValue={currentSales}
          isCurrency={true}
          delta="+18%"
          points={[12, 18, 15, 24, 22, 31, 38, 46]}
          offset="lg:translate-y-0"
          floatDelay={0}
          inView={inView}
        />
        <StatCard
          icon={<ShoppingBag size={16} />}
          label="Mga order"
          rawValue={currentOrders}
          delta="+12%"
          points={[20, 22, 21, 27, 30, 29, 36, 41]}
          offset="lg:translate-y-6"
          floatDelay={0.6}
          inView={inView}
        />
        <StatCard
          icon={<Users size={16} />}
          label="Bagong customer"
          rawValue={currentCustomers}
          delta="+9%"
          points={[8, 10, 14, 13, 19, 18, 25, 28]}
          offset="lg:translate-y-0"
          floatDelay={1.2}
          inView={inView}
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Conversion rate"
          rawValue={currentConversion}
          isPercentage={true}
          delta="+0.6%"
          points={[2.1, 2.4, 2.3, 2.9, 3.1, 3.0, 3.5, 3.8]}
          offset="lg:translate-y-6"
          floatDelay={1.8}
          inView={inView}
        />
      </div>
    </div>
  );
}
