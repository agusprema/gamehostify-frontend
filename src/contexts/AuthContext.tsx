"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { handleApiErrors } from "@/lib/api/errorHandler";
import { me as apiMe, logout as apiLogout } from "@/lib/api/auth";
import { refreshAccessToken, setAccessToken } from "@/lib/api/api";

type User = { id: number; name: string; email: string };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const json = await apiMe();
      if (!json) {
        const err = handleApiErrors(json);
        setUser(null);
        setError(err.message || "Gagal memuat profil");
        return;
      }
      setUser(json?.data ?? null);
      setError(null);
    } catch (e) {
      console.error(e);
      setUser(null);
      setError("Kesalahan jaringan saat memuat profil");
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchMe();
    setLoading(false);
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await apiLogout().catch(() => {});
    } finally {
      setAccessToken(null);
      setUser(null);
      setError(null);
      // Refresh guest cart token after logout
      try {
        const { getCartToken } = await import("@/lib/cart/getCartToken");
        await getCartToken();
      } catch {}
    }
  }, []);

  useEffect(() => {
    // On app load, try refresh using HttpOnly cookie to obtain access token
    (async () => {
      const token = await refreshAccessToken();
      if (token) {
        await refresh();
      } else {
        // No refresh cookie available; consider user logged out
        setLoading(false);
      }
    })();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    refresh,
    logout,
  }), [user, loading, error, refresh, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
