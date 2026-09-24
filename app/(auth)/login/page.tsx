 // app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthSidebar from '@/components/AuthSidebar';
import { Mail, Lock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SellerLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) router.push('/seller');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(`Google sign-in error: ${err.message}`);
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(`Facebook sign-in error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased grid lg:grid-cols-2 animate-in fade-in duration-300">

      <AuthSidebar />

      <div className="flex flex-col justify-center items-center p-8 sm:p-12 bg-paper border-l border-ink/5">
        <div className="lg:hidden mb-10 text-center">
          <Link href="/" className="font-display font-black text-2xl tracking-tight uppercase text-ink">
            Manipu <span className="text-ink/40 font-sans text-xs font-normal lowercase">SaaS</span>
          </Link>
        </div>

        <div className="max-w-sm w-full space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-ink tracking-tight">Welcome Back</h2>
            <p className="text-xs text-ink/40 mt-0.5">Sign in to manage your active digital storefront operations.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-600 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Email address</label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink/30">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-10 pr-4 py-3 text-xs text-ink font-medium outline-none focus:border-ink/30 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Password</label>
                <a href="#" className="text-[11px] font-medium text-ink/40 hover:text-ink transition-colors font-mono">Forgot?</a>
              </div>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink/30">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-10 pr-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl mt-3 text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer group"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span className="text-paper">Signing in…</span>
                </>
              ) : (
                <>
                  <span className="text-paper">Sign In to Dashboard</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-paper" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-ink/5"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-ink/30 uppercase tracking-wider font-mono">Or</span>
            <div className="flex-grow border-t border-ink/5"></div>
          </div>

          {/* Google */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-white text-ink border border-ink/10 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-gray-50 active:scale-[0.98] disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google Account</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            disabled={loading}
            onClick={handleFacebookLogin}
            className="w-full bg-[#1877F2] text-white font-semibold py-3 px-4 rounded-xl text-xs hover:bg-[#1877F2]/90 active:scale-[0.98] disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Sign In with Facebook</span>
          </button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-ink/40 leading-relaxed">
              By signing in, you agree to Manipu&apos;s{' '}
              <Link href="/terms" className="underline font-semibold hover:text-marigold">Terms</Link> and{' '}
              <Link href="/privacy" className="underline font-semibold hover:text-marigold">Privacy Policy</Link>.
            </p>
          </div>

          <div className="border-t border-ink/5 pt-4 text-center">
            <p className="text-xs text-ink/40">
              Don&apos;t have a store yet?{' '}
              <Link href="/signup" className="text-ink font-semibold hover:text-marigold transition-colors">
                Create one for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}