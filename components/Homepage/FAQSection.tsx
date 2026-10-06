// components/FAQSection.tsx
import { Plus } from 'lucide-react';
import { FAQ_ITEMS } from '@/lib/constants'; // ⬅️ Kinuha ang data sa lib

export default function FAQSection() {
  return (
    <section id="faq" className="max-w-6xl mx-auto px-6 py-24">
      <div className="max-w-xl mb-14">
        <p className="text-sm font-semibold text-marigold-dark mb-3">FAQ</p>
        <h2 className="font-display font-bold text-3xl mb-4">
          Questions merchants usually ask
        </h2>
        <p className="text-ink/60 leading-relaxed">
          Everything you need to know before opening your store. Still have a question?{' '}
          <a href="mailto:hello@manipu.ph" className="text-ink underline underline-offset-4 decoration-ink/30 hover:decoration-ink">
            Reach out to us
          </a>.
        </p>
      </div>

      <div className="max-w-3xl border-t border-ink/10">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group border-b border-ink/10 py-5">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-ink">
              <span>{item.q}</span>
              <Plus
                size={18}
                strokeWidth={1.75}
                className="shrink-0 text-ink/40 transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="text-sm text-ink/60 leading-relaxed mt-3 max-w-2xl">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
