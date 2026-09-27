  import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { DriftWall } from "@/components/ui/drift-wall"; // 💡 Dito natin ito i-import mula sa UI folder

// 📸 Ang listahan ng mga larawan ng iyong mga paninda o tindahan sa Manipu Mall
const SHOP_ITEMS = [
  { image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Peaks' },
  { image: 'https://images.unsplash.com/photo-1521499892833-773a6c6fd0b8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Pup' },
  { image: 'https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Falls' },
];

export function ShopHero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
      
      {/* 📝 KALIWANG BAHAGI: TEXT AT BUTTONS (Walang nagbago, malinis pa rin) */}
      <div>
        <span className="inline-flex items-center gap-2 bg-marigold/10 text-marigold-dark text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <Sparkles size={14} />
          Free shipping on your first order
        </span>
        <h1 className="font-display font-bold text-4xl md:text-5xl leading-[1.1] mb-5 text-ink">
          Real products, from real Filipino sellers — all in one place.
        </h1>
        <p className="text-ink/60 text-base leading-relaxed mb-8 max-w-md">
          Shop directly from independent merchants across the Philippines. No middleman, transparent pricing, and secure checkout every time.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/account/signup" className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-6 py-3.5 rounded-full hover:bg-ink/90 transition-colors">Start shopping</Link>
          <Link href="/explore" className="inline-flex items-center gap-2 border border-ink/20 text-ink font-semibold px-6 py-3.5 rounded-full hover:border-ink/40 transition-colors">Browse stores</Link>
        </div>
      </div>

      {/* 🎨 KANAN NA BAHAGI: Dito na natin isasalpak ang Drift Wall! */}
      <div style={{ height: 500 }} className="relative rounded-2xl overflow-hidden border border-ink/10">
        <DriftWall
          items={SHOP_ITEMS}
          columns={4}          // Binawasan natin ng konti para swak sa kalahati ng screen
          tileWidth={160}      // Mas pinaliliit para maganda ang lapat sa mobile size
          tileHeight={110}
          gap={12}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={30}           // Medyo binagalan para swabe ang pag-scroll ng mga produkto
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={40}
          fade={0.6}
          dim={0.55}
          overlayColor="#060010"
          radius={12}
          roll={0}
          pauseOnHover={true}  // Ginawa nating true para kapag tinapatan ng mouse ng customer, hihinto ang takbo para masuri nila ang produkto
          grayscale={false}
        />
      </div>

    </section>
  );
}