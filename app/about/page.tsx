 // app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AnimatedContent from '@/components/AnimatedContent';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-6 py-20 w-full">

        {/* HERO */}
        <AnimatedContent delay={0.1} distance={30}>
          <header className="mb-14">
            <p className="text-sm font-semibold text-marigold-dark uppercase tracking-wider mb-2">
              Our story
            </p>
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-6">
              About Manipu
            </h1>
            <p className="text-xl text-ink/80 leading-relaxed font-light">
              Manipu is a lightweight storefront platform built exclusively for self-reliant,
              independent merchants and creators in the Philippines.
            </p>
          </header>
        </AnimatedContent>

        <div className="space-y-14 border-t border-ink/10 pt-10">

          {/* THE JOURNEY */}
          <AnimatedContent delay={0.15}>
            <div>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Where we started</h2>
              <p className="text-ink/70 leading-relaxed">
                Manipu began with a simple frustration: too many Filipino sellers were building
                something real — a following, a product line, a loyal set of customers — only to
                have it boxed in by platforms that charged high fees, buried their brand under a
                marketplace logo, and made them fight for visibility against thousands of other
                listings. We wanted something different: a store that actually belongs to the
                person running it.
              </p>
            </div>
          </AnimatedContent>

          {/* FOR SELLERS / TENANTS */}
          <AnimatedContent delay={0.2}>
            <div>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Our relationship with sellers</h2>
              <p className="text-ink/70 leading-relaxed">
                To every seller who builds on Manipu, we see ourselves less as a landlord and more
                as infrastructure — the part you shouldn&apos;t have to think about. We handle
                inventory tracking, courier coordination with J&amp;T, Flash, and SPX, and secure
                checkout, so a seller&apos;s time goes into their products and their customers, not
                into fighting a dashboard. Your store carries your name, your colors, and your
                voice — never ours.
              </p>
            </div>
          </AnimatedContent>

          {/* FOR CUSTOMERS */}
          <AnimatedContent delay={0.25}>
            <div>
              <h2 className="font-display font-bold text-xl text-ink mb-3">Our relationship with customers</h2>
              <p className="text-ink/70 leading-relaxed">
                For shoppers, Manipu is designed to stay invisible. When you buy from a store built
                on Manipu, you&apos;re buying directly from that seller — not from us. We&apos;re
                simply what keeps the order accurate, the payment secure, and the delivery on
                track, so the relationship that matters — between you and the person who made or
                curated what you bought — stays direct and honest.
              </p>
            </div>
          </AnimatedContent>

          {/* PRODUCT PHILOSOPHY */}
          <AnimatedContent delay={0.3}>
            <div>
              <h2 className="font-display font-bold text-xl text-ink mb-3">What we build</h2>
              <p className="text-ink/70 leading-relaxed">
                Every feature we ship is judged against one question: does this give a seller more
                control, or does it just add complexity? That&apos;s why Manipu stays deliberately
                simple — clean dashboards, clear pricing, and no hidden fees buried in fine print.
                Powerful tools shouldn&apos;t require a manual to use.
              </p>
            </div>
          </AnimatedContent>

          {/* SERVICE COMMITMENT */}
          <AnimatedContent delay={0.35}>
            <div>
              <h2 className="font-display font-bold text-xl text-ink mb-3">How we support you</h2>
              <p className="text-ink/70 leading-relaxed">
                Behind every store on Manipu is a team that actually answers. Whether it&apos;s a
                courier issue, a payout question, or help setting up your first product listing,
                support isn&apos;t an afterthought — it&apos;s part of what you&apos;re signing up
                for when you build your store with us.
              </p>
            </div>
          </AnimatedContent>

          {/* MISSION & VISION */}
          <AnimatedContent delay={0.4}>
            <div className="grid sm:grid-cols-2 gap-8 bg-white border border-ink/10 rounded-2xl p-8">
              <div>
                <p className="text-xs font-semibold text-teal uppercase tracking-wide mb-2">Our mission</p>
                <p className="text-ink/70 leading-relaxed text-sm">
                  To give every independent Filipino merchant the tools to run a professional
                  online store — without needing a developer, a big budget, or a team.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-marigold-dark uppercase tracking-wide mb-2">Our vision</p>
                <p className="text-ink/70 leading-relaxed text-sm">
                  A future where the neighborhood tindahan and the small-batch creator have the
                  same digital reach as any big brand — each with a store that&apos;s truly their
                  own.
                </p>
              </div>
            </div>
          </AnimatedContent>

        </div>

        {/* CALL TO ACTION */}
        <AnimatedContent delay={0.2} distance={40}>
          <section className="mt-16 pt-12 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Ready to launch your storefront?</h3>
              <p className="text-sm text-ink/60">Set up your dashboard and start selling today.</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link href="/" className="text-sm text-ink/60 hover:text-ink transition-colors">
                Back to home
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold px-5 py-2.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </section>
        </AnimatedContent>

      </main>
    </div>
  );
}