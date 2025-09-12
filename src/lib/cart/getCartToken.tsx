'use client';

let tokenCache: string | null = null;
let inFlightRequest: Promise<string | null> | null = null;
import { apiFetch } from '@/lib/apiFetch';
import { joinUrl } from '@/lib/url';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

export async function getCartToken(): Promise<string | null> {
  // Use in-memory cache first
  if (tokenCache) return tokenCache;

  // Check cookie on client
  const cookieToken = readCookie('X-Cart-Token');
  if (cookieToken) {
    tokenCache = cookieToken;
    return tokenCache;
  }

  // Coalesce concurrent generate calls
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = (async () => {
    try {
      // Endpoint hanya mendukung POST; backend tidak mewajibkan login
      const res = await apiFetch(joinUrl(process.env.BACKEND_API_BASE_URL, 'api/v1/cart/token/generate'), {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Gagal generate cart token (status ' + res.status + ').');
        }
        inFlightRequest = null;
        return null;
      }

      const json = await res.json().catch(() => null as any);
      const newToken: string | null = json?.data?.token ?? null;
      if (newToken) tokenCache = newToken;

      inFlightRequest = null;
      return tokenCache;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Cart token gagal dibuat (network).');
      }
      inFlightRequest = null;
      return null;
    }
  })();

  return inFlightRequest;
}

/**
 * Clear in-memory cache and optionally delete the cookie on client.
 */
export function resetCartTokenCache(options: { clearCookie?: boolean } = {}) {
  tokenCache = null;
  inFlightRequest = null;
  if (options.clearCookie && typeof document !== 'undefined') {
    try {
      // Expire the cookie immediately
      document.cookie = 'X-Cart-Token=; Max-Age=0; path=/';
    } catch {
      // ignore cookie clear failures
    }
  }
}

/**
 * Force-refresh the cart token by clearing cache+cookie then generating again.
 */
export async function regenerateCartToken(): Promise<string | null> {
  resetCartTokenCache({ clearCookie: true });
  return getCartToken();
}
