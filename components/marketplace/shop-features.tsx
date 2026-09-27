export function ShopFeatures() {
  return (
    <section className="border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div>
          <p className="font-display font-bold text-3xl text-marigold-dark mb-2">100%</p>
          <p className="text-sm text-ink/60">Secure checkout on every order, every store.</p>
        </div>
        <div>
          <p className="font-display font-bold text-3xl text-teal mb-2">Direct</p>
          <p className="text-sm text-ink/60">You buy straight from the seller — no middleman.</p>
        </div>
        <div>
          <p className="font-display font-bold text-3xl text-coral mb-2">Tracked</p>
          <p className="text-sm text-ink/60">Follow your order from checkout to your door.</p>
        </div>
      </div>
    </section>
  );
}
