"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register as registerApi } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerApi({ name, email, password });
      // Setelah berhasil mendaftar, redirect ke halaman login
      router.push('/login');
    } catch (err: any) {
      setError(err?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-1">Daftar</h1>
        <p className="text-zinc-400 text-sm mb-6">Buat akun baru untuk mulai.</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full appearance-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              autoComplete="new-password"
              required
              className="w-full appearance-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2.5 text-white font-medium transition-colors"
          >
            {loading ? 'Memproses…' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-4">
          Sudah punya akun?{' '}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">Masuk</a>
        </p>
      </div>
    </div>
  );
}

