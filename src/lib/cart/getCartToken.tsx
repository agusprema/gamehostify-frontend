"use client";

// Simple, safe, client-only cart token fetcher with in-memory cache and
// single-flight behavior to avoid duplicate network calls.

let tokenCache: string | null = null;
let inFlight: Promise<string | null> | null = null;

type CartTokenResponse = {
  data?: { token?: string; expires_at?: string };
  [k: string]: unknown;
};

async function requestCartToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/cart/token/generate", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;
    const json = (await res.json().catch(() => ({}))) as CartTokenResponse;
    const token = (json?.data?.token ?? null) as string | null;
    if (token && token.trim() !== "") tokenCache = token;
    return tokenCache;
  } catch (e) {
    console.error("getCartToken error:", e);
    return null;
  }
}

/**
 * Get a cart token for the current visitor.
 * - Uses in-memory cache to avoid extra requests.
 * - Collapses concurrent calls into a single request.
 * - Set force=true to bypass cache and refetch from the server.
 */
export async function getCartToken(force = false): Promise<string | null> {
  if (!force && tokenCache) return tokenCache;
  if (inFlight) return inFlight;
  inFlight = requestCartToken().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Ensure a non-empty cart token is available. Retries once, then throws. */
export async function ensureCartToken(): Promise<string> {
  let token = await getCartToken();
  if (token && token.trim() !== "") return token;
  token = await getCartToken(true);
  if (token && token.trim() !== "") return token;
  throw new Error("Cart token unavailable");
}

/** Clears the in-memory token cache (does not affect HttpOnly cookie). */
export function clearCartTokenCache() {
  tokenCache = null;
}
