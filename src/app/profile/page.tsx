"use client";

import { useAuthStatus } from '@/hooks/useAuthStatus';
import Link from '@/components/ui/Link';

export default function ProfilePage() {
  const { loading, authenticated, user } = useAuthStatus();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-zinc-400">Memuat…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-white mb-2">Profil</h1>
        <p className="text-zinc-400">
          Kamu belum login. Silakan <Link href="/login" className="text-indigo-400 hover:text-indigo-300">login</Link> terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-white mb-4">Profil</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="text-zinc-300">ID: <span className="text-white">{user?.id ?? '-'}</span></div>
        <div className="text-zinc-300">Nama: <span className="text-white">{user?.name ?? '-'}</span></div>
        <div className="text-zinc-300">Email: <span className="text-white">{user?.email ?? '-'}</span></div>
      </div>
    </div>
  );
}

