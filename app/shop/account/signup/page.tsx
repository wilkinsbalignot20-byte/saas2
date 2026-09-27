 'use client';

import Link from 'next/link';
import { CustomerSignupForm } from '@/components/marketplace/customer-signup-form';

export default function CustomerSignupPage() {
  return (
    <div className="min-h-screen flex bg-paper font-body">

      {/* LEFT: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink items-center justify-center p-12 text-paper relative overflow-hidden">
        <div className="relative z-10 max-w-md text-center">
          {/* FIXED: Changed from href="/" to href="/shop" to keep buyers on the marketplace home */}
          <Link href="/shop" className="font-display font-bold text-3xl tracking-tight mb-4 block">
            Manipu Mall
          </Link>
          <p className="text-paper/60 text-sm leading-relaxed">
            Discover thousands of unique merchant stores across the Philippines, all in one
            place — with secure checkout and tracked delivery.
          </p>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-paper">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="font-display font-bold text-3xl tracking-tight text-ink">Create your account</h2>
            <p className="mt-2 text-sm text-ink/50">
              Join Manipu Mall to shop from verified sellers nationwide.
            </p>
          </div>

          <CustomerSignupForm />
        </div>
      </div>
    </div>
  );
}
