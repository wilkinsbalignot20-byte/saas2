 'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CustomerSignupForm() {
  const router = useRouter();
  const supabase = createClient();

  // Step Tracker (1: Enter Profile & Trigger OTP, 2: Verify OTP Token)
  const [step, setStep] = useState<1 | 2>(1);

  // Account & Contact Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');

  // Structured delivery address
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // OTP Token input state
  const [otpCode, setOtpCode] = useState('');

  // UI state managers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Validation Rule (No password fields needed!)
  const isFormValid =
    fullName && email && phone && street && barangay && city && province && zipCode && agreedToTerms;

  // STEP 1: Request OTP and Send to Gmail
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      // Trigger Supabase Passwordless OTP via Email
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Auto-creates account if email doesn't exist yet
          data: { full_name: fullName, role: 'customer' },
        },
      });

      if (otpError) throw otpError;

      // Move to the verification input field step
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while sending the verification code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and Insert Profile Data to Database
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Verify the 6-digit code submitted by the user
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup', // Use 'signup' or 'magiclink' depending on your Supabase dashboard configuration
      });

      if (verifyError) throw verifyError;

      // Once confirmed, safe-insert customer records into database table
      if (authData.user) {
        const { error: profileError } = await supabase.from('customers').insert([
          {
            id: authData.user.id,
            full_name: fullName,
            phone,
            alt_phone: altPhone || null,
            street,
            barangay,
            city,
            province,
            zip_code: zipCode,
          },
        ]);
        if (profileError) throw profileError;
      }

      setSuccess(true);
      setTimeout(() => router.push('/shop'), 1500); // Redirect directly to marketplace home since they are already logged in
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
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

      {/* RENDER STEP 1: PROFILE FORM */}
      {step === 1 && (
        <form className="space-y-5" onSubmit={handleSendOTP}>
          {/* ACCOUNT */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-marigold-dark uppercase tracking-wide">Account</h3>
            <input
              type="text"
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
            />
          </div>

          {/* CONTACT */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-marigold-dark uppercase tracking-wide">Contact number</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="tel"
                required
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
              <input
                type="tel"
                placeholder="Alternate number (optional)"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
            </div>
            <p className="text-xs text-ink/40">The alternate number helps riders reach you if you miss a call.</p>
          </div>

          {/* DELIVERY ADDRESS */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-marigold-dark uppercase tracking-wide">Delivery address</h3>
            <input
              type="text"
              required
              placeholder="House no. / Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Barangay"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
              <input
                type="text"
                required
                placeholder="City / Municipality"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
              <input
                type="text"
                required
                placeholder="ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-marigold transition-colors"
              />
            </div>
          </div>

          {/* TERMS */}
          <div className="flex items-start gap-3 border-t border-ink/10 pt-4">
            <input
              type="checkbox"
              id="customer-terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink/15 text-ink focus:ring-marigold"
            />
            <label htmlFor="customer-terms" className="text-xs text-ink/60 leading-relaxed select-none">
              I agree to Manipu&apos;s{' '}
              <Link href="/terms" className="font-semibold text-ink underline hover:text-marigold-dark">Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-semibold text-ink underline hover:text-marigold-dark">Privacy Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-paper bg-ink hover:bg-ink/90 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Sending code to email…' : 'Verify via Email OTP'}
          </button>

          <p className="text-center text-xs text-ink/50">
            Already have an account?{' '}
            <Link href="/shop/account/login" className="font-semibold text-ink hover:text-marigold-dark transition-colors">
              Log in here
            </Link>
          </p>
        </form>
      )}

      {/* RENDER STEP 2: VERIFY CODE INPUT */}
      {/* RENDER STEP 2: VERIFY CODE INPUT */}
      {step === 2 && (
        <form className="space-y-5" onSubmit={handleVerifyOTP}>
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
            onClick={() => setStep(1)}
            className="w-full text-center text-xs font-semibold text-ink/60 hover:text-ink transition-colors"
          >
            ← Go back and change details
          </button>
        </form>
      )}
    </>
  );
}
