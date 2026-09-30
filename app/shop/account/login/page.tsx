 "use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();

  // Login inputs ng customer
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status ng form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Ikabit dito ang Supabase auth:
      // const { error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;

      setSuccess(true);

      // Kapag matagumpay ang login, ididirekta sa account dashboard
      setTimeout(() => {
        router.push("/account/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Mali ang email o password. Pakisuri at subukan ulit.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] text-stone-900 placeholder-stone-400 transition focus:border-[#24332b] focus:outline-none focus:ring-2 focus:ring-[#24332b]/20 disabled:bg-stone-100";

  return (
    <main className="grid min-h-screen bg-[#f7f6f2] lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop lang */}
      <aside className="relative hidden flex-col justify-between bg-[#24332b] p-12 text-[#f7f6f2] lg:flex">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Manipu Mall
        </Link>

        <div className="max-w-md">
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight">
            Nandito na ang mga order at paborito mo.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[#f7f6f2]/70">
            Mag-log in para i-track ang deliveries, i-save ang mga address, at
            mag-checkout nang mas mabilis.
          </p>
        </div>

        <p className="text-sm text-[#f7f6f2]/50">
          © {new Date().getFullYear()} Manipu Mall
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Wordmark para sa mobile */}
          <Link
            href="/"
            className="mb-10 block text-lg font-semibold tracking-tight text-[#24332b] lg:hidden"
          >
            Manipu Mall
          </Link>

          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
            Mag-log in
          </h2>
          <p className="mt-2 text-[15px] text-stone-600">
            Maligayang pagbabalik. Ilagay ang detalye ng account mo.
          </p>

          {/* Status alerts */}
          <div aria-live="polite">
            {error && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}
            {success && (
              <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Naka-log in ka na. Papunta sa dashboard…
              </div>
            )}
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-800">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                disabled={loading || success}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-stone-800">
                  Password
                </label>
                <Link
                  href="/account/forgot-password"
                  className="text-sm text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
                >
                  Nakalimutan ang password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  disabled={loading || success}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ilagay ang password"
                  className={`${inputClass} pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Itago ang password" : "Ipakita ang password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 rounded-r-lg px-3.5 text-sm font-medium text-stone-500 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#24332b]/30"
                >
                  {showPassword ? "Itago" : "Ipakita"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#24332b] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#1a261f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#24332b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              {loading ? "Sinusuri…" : "Mag-log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-600">
            Wala ka pang account?{" "}
            <Link
              href="/account/signup"
              className="font-medium text-[#24332b] underline-offset-4 hover:underline"
            >
              Gumawa ng account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}