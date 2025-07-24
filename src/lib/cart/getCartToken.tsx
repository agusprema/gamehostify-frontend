'use client';

let tokenCache: string | null = null;
let inFlightRequest: Promise<string | null> | null = null;

export async function getCartToken(): Promise<string | null> {
  // 1. Gunakan cache jika sudah ada
  if (tokenCache) return tokenCache;

  // 2. Jika sedang ada request, tunggu request tersebut
  if (inFlightRequest) return inFlightRequest;

  // 3. Buat request baru
  inFlightRequest = (async () => {
    const storedToken = localStorage.getItem('cart_token');
    const storedExpiry = localStorage.getItem('cart_token_expiry');

    if (storedToken && storedExpiry) {
      const expires = new Date(storedExpiry).getTime();
      const now = new Date().getTime();

      if (now < expires) {
        tokenCache = storedToken;
        inFlightRequest = null;
        return tokenCache;
      }
    }

    // Generate token ke backend
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/cart/token/generate`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: storedToken ?? null }),
    });

    if (!res.ok) {
      console.error('Gagal generate cart token');
      inFlightRequest = null;
      return null;
    }

    const json = await res.json();
    const newToken = json?.data?.token;
    const expiresAt = json?.data?.expires_at;

    if (newToken && expiresAt) {
      localStorage.setItem('cart_token', newToken);
      localStorage.setItem('cart_token_expiry', expiresAt);
      tokenCache = newToken;
    }

    inFlightRequest = null;
    return tokenCache;
  })();

  return inFlightRequest;
}
