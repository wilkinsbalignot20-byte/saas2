 // components/marketplace/shop/StorefrontHeader.tsx

interface StorefrontHeaderProps {
  store: {
    name: string;
    themeColor: string;
    logoUrl: string | null;
  };
}

export default function StorefrontHeader({ store }: StorefrontHeaderProps) {
  const bannerUrl = (store as any).bannerUrl || null;
  // Fade: transparent sa kaliwa -> kita ang larawan sa kanan
  const fade = 'linear-gradient(to right, transparent 0%, #000 55%)';

  return (
    <header
      className="relative overflow-hidden h-[260px] md:h-[340px]"
      style={{ backgroundColor: store.themeColor }}
    >
      {/* LARAWAN SA KANAN NA MAY FADE */}
      {bannerUrl && (
        <div
          className="absolute inset-y-0 right-0 w-full md:w-3/5 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerUrl})`, maskImage: fade, WebkitMaskImage: fade }}
        />
      )}
      {/* Konting dilim para laging mabasa ang puting text */}
      <div className="absolute inset-0 bg-black/25 md:bg-gradient-to-r md:from-black/20 md:to-transparent" />

      {/* LOGO + PANGALAN SA KALIWA */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center">
        <div className="flex items-center gap-5">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-2xl object-cover bg-white ring-4 ring-white/80 shadow-lg"
            />
          ) : (
            <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-2xl bg-white/20 backdrop-blur-md ring-2 ring-white/40 flex items-center justify-center text-2xl font-bold text-white">
              {store.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {store.name}
            </h1>
            <p className="mt-1 text-sm text-white/80">Official storefront</p>
          </div>
        </div>
      </div>
    </header>
  );
}