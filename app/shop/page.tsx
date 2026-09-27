// app/(shop)/page.tsx
import { ShopHeader } from "@/components/marketplace/shop-header";
import { ShopHero } from "@/components/marketplace/shop-hero";
import { ShopFeatures } from "@/components/marketplace/shop-features";
import { ShopFooter } from "@/components/marketplace/shop-footer";

export default function CustomerMarketplaceHomepage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased">
      {/* 1. Ang Navigation Section */}
      <ShopHeader />

      {/* 2. Ang Malaking Banner (Hero Copy at Images) */}
      <ShopHero />

      {/* 3. Ang Mga Katangian ng Tindahan (100%, Direct, Tracked) */}
      <ShopFeatures />

      {/* 4. Ang Copyright Footer */}
      <ShopFooter />
    </div>
  );
}
