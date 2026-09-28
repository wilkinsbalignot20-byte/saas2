 'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ==========================================
// 1. SECURE 6-DIGIT CODE VERIFICATION VIEW
// ==========================================
interface OtpStepProps {
  email: string;
  otpCode: string;
  setOtpCode: (val: string) => void;
  loading: boolean;
  onVerify: (e: React.FormEvent) => void;
  onBack: () => void;
}

function OtpVerificationStep({ email, otpCode, setOtpCode, loading, onVerify, onBack }: OtpStepProps) {
  return (
    <form className="space-y-5" onSubmit={onVerify}>
      <div className="space-y-2 text-center">
        <p className="text-sm text-ink/70">
          We sent a 6-digit verification code to <span className="font-semibold text-ink">{email}</span>.
        </p>
        <p className="text-xs text-ink/40">Please check your inbox or spam folder.</p>
      </div>

      <input
        type="text"
        required
        maxLength={6}
        placeholder="000000"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
        className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-4 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-marigold transition-colors"
      />

      <button
        type="submit"
        disabled={loading || otpCode.length !== 6}
        className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-paper bg-ink hover:bg-ink/90 disabled:opacity-40 transition-colors"
      >
        {loading ? 'Verifying code…' : 'Confirm & Complete Registration'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs font-semibold text-ink/60 hover:text-ink transition-colors"
      >
        ← Go back and change details
      </button>
    </form>
  );
}

// ==========================================
// 2. MAIN REGISTRATION FORM VIEW
// ==========================================
export function CustomerSignupForm() {
  const router = useRouter();

  // Track screens: 1 = Registration form, 2 = Code entry screen
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Status Trackers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isFormValid =
    fullName && email && phone && street && barangay && city && province && zipCode && agreedToTerms;

  // STEP 1: Mag-request ng OTP sa Inngest sa pamamagitan ng Auth API endpoint
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to trigger verification process.');

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while dispatching your token.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Suriin ang code sa database at irehistro ang customer profile details
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otpCode,
          profile: { fullName, phone, altPhone, street, barangay, city, province, zipCode }
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The code is invalid or has expired.');

      setSuccess(true);
      setTimeout(() => router.push('/shop'), 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid validation entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div className="p-3 text-sm text-coral bg-coral/10 rounded-xl">{error}</div>}
      {success && (
        <div className="p-3 text-sm text-teal bg-teal-light rounded-xl">
          Account verified successfully! Welcome to Manipu Mall…
        </div>
      )}

      {/* DISPLAY FORM FIELDS */}
      {step === 1 && (
        <form className="space-y-5" onSubmit={handleSendOTP}>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-marigold-dark uppercase tracking-wide">Account</h3>
            <input type="text" required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
            <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-marigold-dark uppercase tracking-wide">Contact number</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="tel" required placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
              <input type="tel" placeholder="Alternate number (optional)" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-marigold-dark uppercase tracking-wide">Delivery address</h3>
            <input type="text" required placeholder="House no. / Street" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" required placeholder="Barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
              <input type="text" required placeholder="City / Municipality" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" required placeholder="Province" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors" />
              <input type="text" required placeholder="ZIP code" value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-marigold transition-colors" />
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-ink/10 pt-4">
            <input type="checkbox" id="customer-terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink/15 text-ink focus:ring-marigold" />
            <label htmlFor="customer-terms" className="text-xs text-ink/60 leading-relaxed select-none">
              I agree to Manipu&apos;s <Link href="/terms" className="font-semibold text-ink underline hover:text-marigold-dark">Terms</Link> and <Link href="/privacy" className="font-semibold text-ink underline hover:text-marigold-dark">Privacy Policy</Link>.
            </label>
          </div>

          <button type="submit" disabled={loading || !isFormValid} className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-paper bg-ink hover:bg-ink/90 disabled:opacity-40 transition-colors">
            {loading ? 'Sending code to email…' : 'Verify via Email OTP'}
          </button>
        </form>
      )}

      {/* DISPLAY OTP VERIFICATION MODULE */}
      {step === 2 && (
        <OtpVerificationStep
          email={email}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          loading={loading}
          onVerify={handleVerifyOTP}
          onBack={() => setStep(1)}
        />
      )}
    </>
  );
}
