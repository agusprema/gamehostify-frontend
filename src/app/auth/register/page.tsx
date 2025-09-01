"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { handleApiErrors } from "@/lib/api/errorHandler";
import { api } from "@/lib/api/api";
import Link from "next/link";
import { getCartToken } from "@/lib/cart/getCartToken";

// Uses token-based API client; baseURL from NEXT_PUBLIC_API_URL

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors(undefined);

    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }, { withCredentials: true });
      if (!data) {
        setError("Gagal mendaftar.");
        return;
      }
      // Refresh/issue cart token too (guest or new user)
      await getCartToken().catch(() => null);
      // Setelah register sukses, arahkan ke halaman login
      router.replace("/auth/login");
    } catch (e: unknown) {
      const json: unknown = (e as { response?: { data?: unknown } })?.response?.data ?? {};
      const err = handleApiErrors(json);
      setError(err.message || "Gagal mendaftar.");
      setFieldErrors(err.fields);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Daftar</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Buat akun baru untuk mulai bertransaksi.</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
            {fieldErrors?.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
            {fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
            {fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1">
              Konfirmasi Password
            </label>
            <input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-semibold rounded-md bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
