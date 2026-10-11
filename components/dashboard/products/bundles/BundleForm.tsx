 'use client';

import type { ReactNode } from 'react';
import { Loader2, Save, Plus, Trash2, Layers, Boxes, LayoutGrid, Tag, AlertCircle, Check, Store } from 'lucide-react';
import type { BundleFormProps } from './bundle-form/types';
import { useBundleForm } from './bundle-form/useBundleForm';
import PhotoUploader from './bundle-form/PhotoUploader';
import BundlePreviewCard from './bundle-form/BundlePreviewCard';

const inputCls =
  'w-full rounded-lg border border-[#1B211D]/10 bg-white px-3.5 py-2.5 text-sm text-[#1B211D] placeholder:text-[#1B211D]/35 outline-none transition focus:border-[#1B211D] focus:ring-4 focus:ring-[#1B211D]/5';
const labelCls = 'block text-xs font-semibold text-[#1B211D]/70';
const ghostBtnCls =
  'inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg border border-[#1B211D]/10 bg-white px-3 py-2 text-xs font-semibold text-[#1B211D] transition hover:bg-[#F6F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D]';

function SectionCard({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#1B211D]/10 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#1B211D]/5 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F6F5F1] text-[#1B211D]">
            {icon}
          </span>
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-[#1B211D]">{title}</h2>
            {description && <p className="max-w-xl text-xs leading-relaxed text-[#1B211D]/50">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function BundleForm({ slug, storeName, initialData }: BundleFormProps) {
  const form = useBundleForm(slug, initialData);

  const strategies = [
    {
      value: 'MIX_AND_MATCH',
      title: 'Mix & match bundle',
      body: 'Buyers pick their own combination of items, up to the tier quantity.',
      icon: <LayoutGrid size={18} />,
    },
    {
      value: 'FIXED_PACKAGE',
      title: 'Pre-packed box',
      body: 'Sold as one complete set. Buyers check out without choosing items.',
      icon: <Boxes size={18} />,
    },
  ];

  return (
    <form onSubmit={form.handleSubmit} className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* MAIN CONFIGURATOR */}
      <div className="min-w-0 space-y-6">
        {form.errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in duration-200"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="font-medium">{form.errorMessage}</p>
          </div>
        )}

        {/* PACKAGING STRATEGY */}
        <SectionCard
          icon={<Layers size={16} />}
          title="Packaging strategy"
          description="Choose whether buyers mix their own items or buy a fixed, pre-packed set."
        >
          <div role="radiogroup" aria-label="Packaging strategy" className="grid gap-3 sm:grid-cols-2">
            {strategies.map((s) => {
              const active = form.bundleType === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => form.setBundleType(s.value)}
                  className={`relative flex cursor-pointer select-none items-start gap-3 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D] ${
                    active
                      ? 'border-[#1B211D] bg-[#1B211D]/[0.03] ring-1 ring-[#1B211D]'
                      : 'border-[#1B211D]/10 hover:border-[#1B211D]/30'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active ? 'bg-[#1B211D] text-white' : 'bg-[#F6F5F1] text-[#1B211D]/60'
                    }`}
                  >
                    {s.icon}
                  </span>
                  <span className="space-y-1 pr-6">
                    <span className="block text-sm font-semibold text-[#1B211D]">{s.title}</span>
                    <span className="block text-xs leading-relaxed text-[#1B211D]/50">{s.body}</span>
                  </span>
                  {active && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#1B211D] text-white">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* CAMPAIGN SETTINGS */}
        <SectionCard icon={<Tag size={16} />} title="Bundle details" description="The name and description buyers see on your store.">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className={labelCls}>Bundle name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder="e.g., Sachet Mega Pack Choice Deal"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Description</label>
                <span className="text-[11px] text-[#1B211D]/40">Optional</span>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                placeholder="Explain how customers can pick and mix their items..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </SectionCard>

        {/* PRICING TIERS */}
        <SectionCard
          icon={<Layers size={16} />}
          title="Pricing & package tiers"
          description="Each tier has its own quantity, price and product photo. Tip: add a Qty 1 tier to show the savings on bigger packs."
          action={
            <button type="button" onClick={form.handleAddTier} className={ghostBtnCls}>
              <Plus size={14} />
              <span>Add tier</span>
            </button>
          }
        >
          <div className="space-y-4">
            {form.tiers.map((tier, index) => {
              const perPiece = tier.quantity > 0 && tier.price > 0 ? tier.price / tier.quantity : 0;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#1B211D]/10 bg-[#F6F5F1]/30 p-4 animate-in fade-in slide-in-from-top-2 duration-200 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1B211D]">Tier {index + 1}</p>
                    {form.tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => form.handleRemoveTier(index)}
                        aria-label={`Remove tier ${index + 1}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-[168px_minmax(0,1fr)]">
                    <PhotoUploader
                      imageUrl={tier.images}
                      alt={`Tier ${index + 1} product photo`}
                      emptyLabel="Upload product photo"
                      onUploaded={(url) => form.handleTierChange(index, 'images', url)}
                    />

                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className={labelCls}>Quantity (pcs)</label>
                          <input
                            type="number"
                            value={tier.quantity}
                            onChange={(e) => form.handleTierChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className={inputCls}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelCls}>Tier price</label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1B211D]/40">
                              ₱
                            </span>
                            <input
                              type="number"
                              value={tier.price || ''}
                              onChange={(e) => form.handleTierChange(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className={`${inputCls} pl-8`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-[#1B211D]/5 bg-white px-3.5 py-2.5 text-xs">
                        <span className="text-[#1B211D]/50">Price per piece</span>
                        <span className="font-semibold text-[#1B211D]">
                          {perPiece > 0
                            ? `₱${perPiece.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '—'}
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed text-[#1B211D]/40">
                        {tier.images
                          ? 'This photo is shown to buyers for this tier.'
                          : 'A product photo is required for every tier.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* CHOICES (MIX & MATCH ONLY) */}
        {form.bundleType === 'MIX_AND_MATCH' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <SectionCard
              icon={<LayoutGrid size={16} />}
              title="Item choices"
              description="Add the flavors, styles or variants buyers can mix into their bundle. Each choice needs a name and a photo."
              action={
                <button type="button" onClick={form.handleAddChoice} className={ghostBtnCls}>
                  <Plus size={14} />
                  <span>Add choice</span>
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {form.choices.map((choice, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-[#1B211D]/10 bg-white animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="relative">
                      <PhotoUploader
                        imageUrl={choice.imageUrl}
                        alt={choice.name || `Choice ${index + 1} photo`}
                        emptyLabel="Upload photo"
                        className="rounded-none border-0 border-b border-[#1B211D]/10"
                        onUploaded={(url) => form.handleChoiceChange(index, 'imageUrl', url)}
                      />
                      {form.choices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => form.handleRemoveChoice(index)}
                          aria-label={`Remove choice ${index + 1}`}
                          className="absolute right-2 top-2 cursor-pointer rounded-lg bg-white/95 p-1.5 text-red-600 shadow-sm backdrop-blur transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 p-3">
                      <label className={labelCls}>Choice name</label>
                      <input
                        type="text"
                        value={choice.name}
                        onChange={(e) => form.handleChoiceChange(index, 'name', e.target.value)}
                        placeholder="e.g., Caramel"
                        className={inputCls}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-1 space-y-2 rounded-2xl border border-dashed border-[#1B211D]/15 bg-white p-8 text-center duration-200">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6F5F1] text-[#1B211D]/50">
              <Boxes size={18} />
            </div>
            <p className="text-sm font-semibold text-[#1B211D]/70">No item choices needed</p>
            <p className="mx-auto max-w-md text-xs leading-relaxed text-[#1B211D]/45">
              This bundle is sold as a pre-packed box. Buyers check out the tier directly, so there's no selection step to set up.
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 border-t border-[#1B211D]/10 pt-6">
          <button
            type="submit"
            disabled={form.loading}
            className="inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-xl bg-[#1B211D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B211D]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{initialData?.id ? 'Update bundle' : 'Save bundle'}</span>
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-4 self-start lg:sticky lg:top-6">
        <BundlePreviewCard
          name={form.name}
          bundleType={form.bundleType}
          tiers={form.tiers}
          choices={form.choices}
        />

        <div className="flex items-center gap-3 rounded-2xl border border-[#1B211D]/10 bg-white p-4 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6F5F1] text-[#1B211D]/60">
            <Store size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-[#1B211D]/45">Managing bundle for</p>
            <p className="truncate text-sm font-semibold text-[#1B211D]">{storeName}</p>
          </div>
        </div>
      </aside>
    </form>
  );
}