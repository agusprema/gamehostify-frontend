"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      // Token ditaruh di cookie oleh BFF; langsung redirect
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-1">Masuk</h1>
        <p className="text-zinc-400 text-sm mb-6">Silakan masuk untuk melanjutkan.</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              className="w-full appearance-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              className="w-full appearance-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2.5 text-white font-medium transition-colors"
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-4">
          Belum punya akun?{' '}
          <a href="/register" className="text-indigo-400 hover:text-indigo-300">Daftar</a>
        </p>
      </div>
    </div>
  );
}

