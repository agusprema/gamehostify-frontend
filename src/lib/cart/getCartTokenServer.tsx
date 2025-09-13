// lib/cart/getCartTokenServer.ts
import { cookies } from 'next/headers';
import { apiFetch } from '@/lib/apiFetch';
import { joinUrl } from '@/lib/url';

export async function getCartTokenServer(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('X-Cart-Token')?.value;

  if (cookieToken) return cookieToken;

  // Jika tidak ada, panggil endpoint generate token
  const res = await apiFetch(joinUrl(process.env.BACKEND_API_BASE_URL, 'api/v1/cart/token/generate'), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!res.ok) return null;

  const json = await res.json();
  return json?.data?.token ?? null;
}
