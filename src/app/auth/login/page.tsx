"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { handleApiErrors } from "@/lib/api/errorHandler";
import { api, setAccessToken } from "@/lib/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import Link from "next/link";

// Token-based auth with in-memory persistence

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors(undefined);

    try {
      const { data } = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const token: string | null = data?.data?.token ?? data?.token ?? null;
      if (!token) {
        const err = handleApiErrors(data);
        setError(err.message || "Gagal masuk.");
        setFieldErrors(err.fields);
        return;
      }
      // Persist in memory only (no localStorage). Refresh token is in HttpOnly cookie.
      setAccessToken(token);
      // Refresh cart token for this user (sends X-Cart-Token + Authorization)
      await getCartToken().catch(() => null);
      await refresh();
      router.replace("/");
    } catch (e: unknown) {
      const respData: unknown = (e as { response?: { data?: unknown } }).response?.data ?? {};
      const err = handleApiErrors(respData);
      setError(err.message || "Terjadi kesalahan jaringan.");
      setFieldErrors(err.fields);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Masuk</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Gunakan email dan password akun Anda.</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
            {fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-semibold rounded-md bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-primary-600 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
