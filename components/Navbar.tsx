 // components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-display font-bold text-xl tracking-tight">
          Manipu
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
          <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
          <a href="#audiences" className="hover:text-ink transition-colors">For sellers</a>
          {/* 🆕 ADDED ABOUT LINK */}
          <Link href="/about" className="hover:text-ink transition-colors">About</Link>
          <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
          <Link href="/explore" className="hover:text-ink transition-colors">Explore stores</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-full hover:bg-ink/5 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </header>
  );
}
