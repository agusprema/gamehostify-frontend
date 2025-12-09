"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { regenerateCartToken } from "@/lib/cart/getCartToken";
import { useCart } from "@/contexts/CartContext";
import { me as fetchMe, AUTH_EVENT, type AuthAction } from "@/lib/auth";

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
      type MeResponse = { authenticated?: boolean; user?: User } | null;
      const json = (await fetchMe()) as MeResponse;
      setAuthenticated(Boolean(json && json.authenticated));
      setUser((json && json.user) ?? null);
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
  const refreshAndRegenerate = useCallback((action?: AuthAction) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      await refresh();
      // Optimize: only touch cart for login/logout or legacy events
      if (!action) {
        // legacy: unknown source, do both
        regenerateCartToken();
        fetchCart();
        return;
      }
      if (action === 'login' || action === 'logout') {
        // auth.ts already regenerates token; only refetch cart
        fetchCart();
      }
    }, 150);
  }, [refresh, fetchCart]);

  // listen events
  useEffect(() => {
    function onAuthChanged(e: Event) {
      const action = (e as CustomEvent<{ action?: AuthAction }>).detail?.action;
      refreshAndRegenerate(action);
    }

    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_EVENT, onAuthChanged as EventListener);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(AUTH_EVENT, onAuthChanged as EventListener);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [refreshAndRegenerate]);

  return { loading, authenticated, user, refresh };
}
