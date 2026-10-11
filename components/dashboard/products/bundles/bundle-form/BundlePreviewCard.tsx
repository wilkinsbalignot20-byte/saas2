import { Boxes, ImageIcon, LayoutGrid } from 'lucide-react';
import type { BundleTierInput, BundleChoiceInput } from './types';

interface BundlePreviewCardProps {
  name: string;
  bundleType: string;
  tiers: BundleTierInput[];
  choices: BundleChoiceInput[];
}

const peso = (n: number) =>
  `₱${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Read-only na preview kung paano lalabas ang bundle sa storefront.
 * Binabasa lang ang kasalukuyang form state, walang sariling logic.
 */
export default function BundlePreviewCard({ name, bundleType, tiers, choices }: BundlePreviewCardProps) {
  const isMix = bundleType === 'MIX_AND_MATCH';
  const cover = tiers.find((t) => t.images)?.images || '';
  const pricedTiers = tiers.filter((t) => t.price > 0 && t.quantity > 0);
  const minPrice = pricedTiers.length ? Math.min(...pricedTiers.map((t) => t.price)) : 0;
  const pickedChoices = choices.filter((c) => c.imageUrl);
  const visibleChoices = pickedChoices.slice(0, 5);
  const hiddenCount = pickedChoices.length - visibleChoices.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1B211D]/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1B211D]/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-[#1B211D]">Storefront preview</h3>
        <span className="text-[11px] text-[#1B211D]/40">Updates as you edit</span>
      </div>

      <div className="p-4">
        <div className="overflow-hidden rounded-xl border border-[#1B211D]/10">
          <div className="relative aspect-square w-full bg-[#F6F5F1]">
            {cover ? (
              <img src={cover} alt={name || 'Bundle preview'} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#1B211D]/30">
                <ImageIcon size={28} />
                <span className="text-xs">Your product photo will appear here</span>
              </div>
            )}
            <span
              className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold shadow-sm ${
                isMix ? 'bg-[#D4EDDA] text-[#155724]' : 'bg-blue-50 text-blue-700'
              }`}
            >
              {isMix ? <LayoutGrid size={11} /> : <Boxes size={11} />}
              {isMix ? 'Mix & match' : 'Pre-packed'}
            </span>
          </div>

          <div className="space-y-3 p-4">
            <div className="space-y-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#1B211D]">
                {name.trim() || 'Your bundle name'}
              </p>
              <p className="text-xs text-[#1B211D]/50">
                {minPrice > 0 ? (
                  <>
                    From <span className="text-base font-bold text-[#1B211D]">{peso(minPrice)}</span>
                  </>
                ) : (
                  'Set a tier price to show it here'
                )}
              </p>
            </div>

            {pricedTiers.length > 0 && (
              <ul className="space-y-1.5 border-t border-[#1B211D]/5 pt-3">
                {pricedTiers.map((t, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="text-[#1B211D]/60">{t.quantity} pcs</span>
                    <span className="font-semibold text-[#1B211D]">{peso(t.price)}</span>
                  </li>
                ))}
              </ul>
            )}

            {isMix && visibleChoices.length > 0 && (
              <div className="space-y-2 border-t border-[#1B211D]/5 pt-3">
                <p className="text-[11px] font-medium text-[#1B211D]/50">Choose your picks</p>
                <div className="flex items-center gap-1.5">
                  {visibleChoices.map((c, i) => (
                    <img
                      key={i}
                      src={c.imageUrl}
                      alt={c.name || 'Choice'}
                      className="h-9 w-9 rounded-lg border border-[#1B211D]/10 object-cover"
                    />
                  ))}
                  {hiddenCount > 0 && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F6F5F1] text-[11px] font-semibold text-[#1B211D]/60">
                      +{hiddenCount}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div
              aria-hidden="true"
              className="w-full rounded-lg bg-[#1B211D] py-2.5 text-center text-xs font-semibold text-white"
            >
              {isMix ? 'Build your bundle' : 'Add to cart'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}