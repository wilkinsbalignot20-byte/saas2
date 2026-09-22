 // app/page.tsx
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FAQSection from '@/components/FAQSection';

export default function SaasLandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased">
      {/* 1. NAVBAR COMPONENT */}
      <Navbar />

      {/* 2. HERO COMPONENT (May kasama nang Rotating Text sa loob!) */}
      <Hero />

      {/* 3. AUDIENCES SECTION */}
      <section id="audiences" className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-px bg-ink/10">
          <div className="bg-paper p-10">
            <p className="text-sm font-semibold text-marigold-dark mb-3">For sellers</p>
            <h2 className="font-display font-bold text-2xl mb-4">Run your tindahan from one dashboard</h2>
            <ul className="space-y-2 text-ink/60 text-sm mb-8">
              <li>Products, stock, and orders in one place</li>
              <li>Print shipping labels for J&amp;T, Flash, SPX</li>
              <li>Track your balance and payouts</li>
            </ul>
            <Link href="/signup" className="inline-flex items-center gap-2 font-semibold text-ink border-b-2 border-marigold pb-0.5">
              Create a seller account
            </Link>
          </div>
          <div className="bg-paper p-10">
            <p className="text-sm font-semibold text-teal mb-3">For shoppers</p>
            <h2 className="font-display font-bold text-2xl mb-4">Discover independent stores</h2>
            <ul className="space-y-2 text-ink/60 text-sm mb-8">
              <li>Shop directly from the merchant, no middleman</li>
              <li>Track orders from checkout to delivery</li>
              <li>Chat with the seller in real time</li>
            </ul>
            <Link href="/signup" className="inline-flex items-center gap-2 font-semibold text-ink border-b-2 border-teal pb-0.5">
              Create a shopper account
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="font-display font-bold text-3xl mb-14 max-w-md">From sign-up to your first sale, in three steps</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <p className="font-display font-bold text-4xl text-marigold mb-4">1</p>
            <h3 className="font-semibold mb-2">Sign up</h3>
            <p className="text-sm text-ink/60 leading-relaxed">Create your seller account and pick your store&apos;s address.</p>
          </div>
          <div>
            <p className="font-display font-bold text-4xl text-marigold mb-4">2</p>
            <h3 className="font-semibold mb-2">Customize your store</h3>
            <p className="text-sm text-ink/60 leading-relaxed">Add your logo, pick your colors, and list your first products.</p>
          </div>
          <div>
            <p className="font-display font-bold text-4xl text-marigold mb-4">3</p>
            <h3 className="font-semibold mb-2">Start selling</h3>
            <p className="text-sm text-ink/60 leading-relaxed">Share your store link and start taking orders the same day.</p>
          </div>
        </div>
      </section>

      {/* 5. FEATURE TAGS SECTION */}
      <section className="border-t border-ink/10 bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display font-bold text-2xl mb-10">Everything a tindahan needs, already built in</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Inventory tracking</p>
              <p className="text-sm text-paper/50">Never oversell what you don&apos;t have in stock.</p>
            </div>
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Order management</p>
              <p className="text-sm text-paper/50">Pending to delivered, all in one view.</p>
            </div>
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Secure checkout</p>
              <p className="text-sm text-paper/50">Card and e-wallet payments, handled for you.</p>
            </div>
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Sales insights</p>
              <p className="text-sm text-paper/50">See what&apos;s selling and who&apos;s buying.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ COMPONENT */}
      <FAQSection />

      {/* 7. FOOTER SECTION */}
      <footer id="explore" className="bg-ink text-paper/60 border-t border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="font-display font-bold text-lg text-paper mb-1">Manipu</p>
            <p className="text-sm">The storefront platform for independent merchants.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-paper transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-paper transition-colors">Sign up</Link>
            <span className="text-paper/30">© 2026 Manipu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
