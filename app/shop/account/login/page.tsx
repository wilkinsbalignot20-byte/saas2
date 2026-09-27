"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();

  // Mga state variables para sa login inputs ng customer
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mga state para sa status ng form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Dito natin ikakabit ang Supabase Client auth mo para sa login balang araw:
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      console.log("Customer attempting login:", { email, password });

      setSuccess(true);

      // Kapag matagumpay ang login, ididirekta natin sila sa kanilang bagong account dashboard
      setTimeout(() => {
        router.push("/account/dashboard");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Maling email o password. Pakisuri muli.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow border border-gray-100">

        {/* Header ng Form */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Mag-log in sa Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Maligayang pagbabalik sa Manipu Mall
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
            Matagumpay na nakapasok! Pumapasok sa dashboard...
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">

            {/* Input para sa Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            {/* Input para sa Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
            >
              {loading ? "Sinusuri..." : "Mag-log in"}
            </button>
          </div>
        </form>

        {/* Footer Link patungong Signup */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Wala ka pang account?{" "}
            <Link href="/account/signup" className="font-medium text-black hover:underline">
              Mag-signup dito
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
