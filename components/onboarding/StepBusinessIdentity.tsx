// components/onboarding/StepBusinessIdentity.tsx
'use client';

import React from 'react';

interface StepBusinessIdentityProps {
  businessName: string;
  setBusinessName: (val: string) => void;
  businessType: string;
  setBusinessType: (val: string) => void;
  contactNumber: string;
  setContactNumber: (val: string) => void;
  pickupAddress: string;
  setPickupAddress: (val: string) => void;
  onNext: () => void;
}

export default function StepBusinessIdentity({
  businessName, setBusinessName, businessType, setBusinessType,
  contactNumber, setContactNumber, pickupAddress, setPickupAddress, onNext
}: StepBusinessIdentityProps) {
  
  // Tinitiyak na hindi pwedeng mag-next kung may kulang na field
  const isValid = businessName && contactNumber && pickupAddress;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <h2 className="font-display font-semibold text-marigold uppercase tracking-wider text-xs">
        Section 1: Business Identity
      </h2>
      
      {/* Business Name Input */}
      <input
        type="text" required placeholder="Registered business name" value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 transition-colors"
      />
      
      <div className="grid grid-cols-2 gap-3">
        {/* Business Type Dropdown */}
        <select
          value={businessType} onChange={(e) => setBusinessType(e.target.value)}
          className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 transition-colors text-ink/80 cursor-pointer"
        >
          <option value="Single Proprietorship">Single Proprietorship</option>
          <option value="Partnership">Partnership</option>
          <option value="Corporation">Corporation</option>
        </select>
        
        {/* Contact Number Input */}
        <input
          type="tel" required placeholder="Contact number" value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 transition-colors"
        />
      </div>
      
      {/* Pickup Address Textarea */}
      <textarea
        required placeholder="Pickup address (for J&T, Flash, SPX riders)" value={pickupAddress}
        onChange={(e) => setPickupAddress(e.target.value)} rows={2}
        className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 transition-colors resize-none"
      />

      {/* Controller Next Button */}
      <button
        type="button" disabled={!isValid} onClick={onNext}
        className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl mt-4 text-sm disabled:opacity-40 transition active:scale-95 cursor-pointer"
      >
        Next: Configure Storefront
      </button>
    </div>
  );
}
