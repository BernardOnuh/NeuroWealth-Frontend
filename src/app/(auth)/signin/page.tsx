"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-900">
      <div className="w-full max-w-[420px] bg-dark-800/50 p-8 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your AI-powered yield</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 min-h-[44px] text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 min-h-[44px] text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all placeholder:text-slate-600"
              required
            />
            <p className="text-[10px] text-slate-500 italic px-1">Hint: Use &quot;password123&quot; for mock login</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-[14px] animate-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-sm font-bold bg-brand-400 hover:bg-brand-300 text-dark-900 transition-all shadow-lg shadow-brand-400/20"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
