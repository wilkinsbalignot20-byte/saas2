// app/shop/login/page.tsx
import React from 'react';
import Link from 'next/link';

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm space-y-6">
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Mag-Log In</h1>
          <p className="text-xs text-slate-500">Pumasok bilang Mamimili</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Email</label>
            <input 
              type="email" 
              placeholder="customer@email.com" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
          >
            Pumasok sa Mall 🛒
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 pt-2 border-t border-slate-100">
          Wala pang account?{" "}
          <Link href="/shop/signup" className="text-indigo-600 font-bold hover:underline">
            Mag-register dito
          </Link>
        </p>

      </div>
    </div>
  );
}
