 interface Props {
  name: string;
  quantity: string;
  price: string;
  onNameChange: (v: string) => void;
  onQuantityChange: (v: string) => void;
  onPriceChange: (v: string) => void;
}

const inputCls =
  'w-full rounded-lg border border-[#1B211D]/10 bg-white px-3.5 py-2.5 text-sm text-[#1B211D] placeholder:text-[#1B211D]/35 outline-none transition focus:border-[#1B211D] focus:ring-4 focus:ring-[#1B211D]/5';
const labelCls = 'block text-xs font-semibold text-[#1B211D]/70';

export default function BundleDetailsSection({
  name, quantity, price, onNameChange, onQuantityChange, onPriceChange,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#1B211D]/10 bg-white shadow-sm">
      <header className="border-b border-[#1B211D]/5 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[#1B211D]">Bundle promotion criteria</h2>
        <p className="mt-0.5 text-xs text-[#1B211D]/50">Name the package and set its quantity and price.</p>
      </header>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelCls}>Bundle package name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g., Ultimate Flavor Trio Pack, Buy 5 promo mix"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Required quantity (pcs)</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            placeholder="3"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Wholesale package price</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm font-semibold text-[#1B211D]/40">₱</span>
            <input
              type="text"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0.00"
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}