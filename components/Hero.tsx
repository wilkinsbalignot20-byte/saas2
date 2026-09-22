 // components/Hero.tsx
import Link from 'next/link';
import RotatingText from '@/components/RotatingText'; // ⬅️ I-import ang inayos nating component

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <p className="text-sm font-semibold text-marigold-dark mb-4">
          Built for Filipino merchants
        </p>
        
        {/* 🚀 DITO NATIN INILAGAY ANG ROTATING TEXT SA LOOB NG H1 */}
        <h1 className="font-display font-bold text-5xl leading-[1.15] tracking-tight mb-6 flex flex-wrap items-center gap-x-2">
          <span>Every</span>
          <RotatingText
            texts={['tindahan', 'shop', 'boutique', 'negosyo']}
            mainClassName="bg-marigold text-black px-3 py-0.5 rounded-xl overflow-hidden inline-flex"
            staggerDuration={0.025}
            splitBy="characters"
            rotationInterval={2500}
          />
          <span>deserves its own storefront</span>
        </h1>

        <p className="text-lg text-ink/60 leading-relaxed max-w-md mb-8">
          Manipu gives you a fully working online store in minutes — your own products,
          your own colors, your own customers. We handle the payments, shipping, and
          stock behind the scenes.
        </p>
        
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-6 py-3.5 rounded-full hover:bg-ink/90 transition-colors"
          >
            Start your store
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 border border-ink/20 font-semibold px-6 py-3.5 rounded-full hover:border-ink/40 transition-colors"
          >
            Browse existing stores
          </Link>
        </div>
        <p className="text-sm text-ink/40 mt-6">No credit card required to start.</p>
      </div>

      {/* 🏪 DYNAMIC STOREFRONT STACK AREA (Mananatiling pareho ang video boxes mo sa ilalim) */}
      <div className="relative h-[420px] hidden lg:block">
        <Link href="/explore" className="absolute top-0 left-4 w-72 -rotate-6 rounded-2xl bg-ink text-paper p-5 shadow-xl block hover:-translate-y-1 transition-transform cursor-pointer group select-none overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-semibold text-sm group-hover:text-marigold transition-colors">Manipu Wear</span>
            <span className="w-2 h-2 rounded-full bg-marigold" />
          </div>
          <div className="h-24 rounded-lg bg-marigold/10 mb-4 relative overflow-hidden border border-paper/10">
            <video src="/wear.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
          </div>
          <div className="h-2 w-3/4 rounded bg-paper/20 mb-2" />
          <div className="h-2 w-1/2 rounded bg-paper/20" />
        </Link>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none select-none">
          <div className="bg-white text-ink border border-ink/15 font-display font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl animate-pulse whitespace-nowrap">
            Go to our market
          </div>
        </div>

        <Link href="/explore" className="absolute top-24 right-2 w-72 rotate-3 rounded-2xl bg-teal text-white p-5 shadow-xl block hover:-translate-y-1 transition-transform cursor-pointer group select-none overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-semibold text-sm group-hover:text-marigold transition-colors">Coffee Shop</span>
            <span className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div className="h-24 rounded-lg bg-white/10 mb-4 relative overflow-hidden border border-white/10">
            <video src="/coffee.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
          </div>
          <div className="h-2 w-2/3 rounded bg-white/25 mb-2" />
          <div className="h-2 w-1/3 rounded bg-white/25" />
        </Link>

        <Link href="/explore" className="absolute bottom-0 left-16 w-72 -rotate-2 rounded-2xl bg-white border border-ink/10 p-5 shadow-xl block hover:-translate-y-1 transition-transform cursor-pointer group select-none overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-semibold text-sm text-ink group-hover:text-marigold transition-colors">Sariling Tindahan</span>
            <span className="w-2 h-2 rounded-full bg-coral" />
          </div>
          <div className="h-24 rounded-lg bg-coral/10 mb-4 relative overflow-hidden border border-ink/10">
            <video src="/tindahan.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
          </div>
          <div className="h-2 w-3/5 rounded bg-ink/10 mb-2" />
          <div className="h-2 w-2/5 rounded bg-ink/10" />
        </Link>
      </div>
    </section>
  );
}
