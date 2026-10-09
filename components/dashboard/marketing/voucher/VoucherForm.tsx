// components/dashboard/marketing/voucher/VoucherForm.tsx
"use client";

import { useId, useState } from "react";
import { Shuffle } from "lucide-react";
import { Field, inputClass, btnPrimary, btnSecondary } from "../shared";
import DiscountTypeToggle from "./DiscountTypeToggle";
import VoucherPreview from "./VoucherPreview";
import { generateCode } from "./utils";
import type { DiscountType, VoucherPayload } from "./types";

interface Props {
  /** Mga code na existing na, para sa duplicate check */
  existingCodes: string[];
  saving: boolean;
  onSubmit: (payload: VoucherPayload) => void;
  onCancel: () => void;
}

/**
 * Hawak ng form na ito ang sarili niyang state.
 * Kapag na-unmount (isinara ng parent), automatic na nare-reset lahat.
 */
export default function VoucherForm({ existingCodes, saving, onSubmit, onCancel }: Props) {
  const uid = useId();

  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("FIXED");
  const [value, setValue] = useState("");
  const [minSpend, setMinSpend] = useState("0");
  const [maxClaims, setMaxClaims] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Parsed values
  const cleanCode = code.toUpperCase().trim();
  const numValue = parseFloat(value);
  const numMin = parseFloat(minSpend || "0");
  const numLimit = maxClaims.trim() === "" ? null : Number(maxClaims);
  const expiresDate = expiresAt ? new Date(expiresAt) : null;

  // Validation
  const errors = {
    code: !cleanCode
      ? "Enter a promo code."
      : !/^[A-Z0-9_-]{3,20}$/.test(cleanCode)
      ? "Use 3 to 20 letters, numbers, - or _."
      : existingCodes.some((c) => c.toUpperCase() === cleanCode)
      ? "This code already exists."
      : "",
    value: !(numValue > 0)
      ? "Enter a value greater than 0."
      : type === "PERCENTAGE" && numValue > 100
      ? "Percentage can't be more than 100."
      : "",
    minSpend: numMin < 0 || Number.isNaN(numMin) ? "Minimum spend can't be negative." : "",
    maxClaims:
      numLimit !== null && (!Number.isInteger(numLimit) || numLimit < 1) ? "Enter a whole number of 1 or more." : "",
    expiresAt: expiresDate && expiresDate <= new Date() ? "Expiry must be in the future." : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const showErr = (m: string) => (submitted ? m : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    onSubmit({
      code: cleanCode,
      discountType: type,
      discountValue: numValue,
      minSpend: numMin || 0,
      maxClaims: numLimit,
      expiresAt: expiresDate ? expiresDate.toISOString() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field id={`${uid}-code`} label="Promo code" hint="Customers type this at checkout." error={showErr(errors.code)}>
          <div className="flex gap-2">
            <input
              id={`${uid}-code`}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LESS200"
              maxLength={20}
              className={`${inputClass} font-mono uppercase`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setCode(generateCode())}
              className={`${btnSecondary} shrink-0 px-3`}
              title="Generate a random code"
              aria-label="Generate a random code"
            >
              <Shuffle size={16} />
            </button>
          </div>
        </Field>

        <DiscountTypeToggle uid={uid} value={type} onChange={setType} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={`${uid}-value`}
          label={type === "FIXED" ? "Discount amount (₱)" : "Discount percentage (%)"}
          error={showErr(errors.value)}
        >
          <input
            id={`${uid}-value`}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "FIXED" ? "200" : "10"}
            className={inputClass}
          />
        </Field>
        <Field
          id={`${uid}-min`}
          label="Minimum spend (₱)"
          hint="Set 0 for no minimum."
          error={showErr(errors.minSpend)}
        >
          <input
            id={`${uid}-min`}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={minSpend}
            onChange={(e) => setMinSpend(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={`${uid}-limit`}
          label="Usage limit (optional)"
          hint="Total number of customers who can claim it. Leave blank for unlimited."
          error={showErr(errors.maxClaims)}
        >
          <input
            id={`${uid}-limit`}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={maxClaims}
            onChange={(e) => setMaxClaims(e.target.value)}
            placeholder="e.g. 50"
            className={inputClass}
          />
        </Field>
        <Field
          id={`${uid}-expires`}
          label="Expires on (optional)"
          hint="Leave blank if the voucher never expires."
          error={showErr(errors.expiresAt)}
        >
          <input
            id={`${uid}-expires`}
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <VoucherPreview
        code={cleanCode}
        type={type}
        value={numValue}
        minSpend={numMin}
        limit={numLimit}
        expiresDate={expiresDate}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Publishing..." : "Publish voucher"}
        </button>
      </div>
    </form>
  );
}