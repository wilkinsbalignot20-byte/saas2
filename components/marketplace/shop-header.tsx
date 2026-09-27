 import Link from 'next/link';

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/" className="font-display font-bold text-xl tracking-tight">
          Manipu <span className="text-ink/40 font-normal">Mall</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/60">
          <Link href="/explore" className="hover:text-ink transition-colors">Explore stores</Link>
          <Link href="/deals" className="hover:text-ink transition-colors">Deals</Link>
          <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
          <Link href="/about" className="hover:text-ink transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* Binago natin ito para tumama sa app/shop/account/login */}
          <Link href="/shop/account/login" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-ink/5 transition-colors">Log in</Link>
          {/* Binago natin ito para tumama sa app/shop/account/signup */}
          <Link href="/shop/account/signup" className="text-sm font-semibold px-4 py-2 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors">Sign up</Link>
        </div>
      </div>
    </header>
  );
}
