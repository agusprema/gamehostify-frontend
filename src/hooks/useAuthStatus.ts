"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { regenerateCartToken } from "@/lib/cart/getCartToken";
import { useCart } from "@/contexts/CartContext";

type User = { 
  id: number | null; 
  name: string | null; 
  email: string | null;
  avatar: string | null;
  phone: string | null;
  birth_date: Date | null;
  gender: string | null;
} | null;

export function useAuthStatus() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(null);
  const {fetchCart} = useCart();

  const inFlight = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json) {
        setAuthenticated(Boolean(json.authenticated));
        setUser(json.user ?? null);
      } else {
        setAuthenticated(false);
        setUser(null);
      }
    } catch {
      setAuthenticated(false);
      setUser(null);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // helper: debounce pemanggilan refresh + regenerate
  const refreshAndRegenerate = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      await refresh();
      regenerateCartToken();
      fetchCart();
    }, 150);
  }, [refresh, fetchCart]);

  // listen events
  useEffect(() => {
    function onAuthChanged() {
      refreshAndRegenerate();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("auth:changed", onAuthChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth:changed", onAuthChanged);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [refreshAndRegenerate]);

  return { loading, authenticated, user, refresh };
}
