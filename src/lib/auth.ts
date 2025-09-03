import { apiFetch } from '@/lib/apiFetch';
import { regenerateCartToken, resetCartTokenCache } from '@/lib/cart/getCartToken';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string };

export async function login(payload: LoginPayload) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    // Important: allow Next to handle and set cookies via BFF
    credentials: 'include',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (json?.message as string) || 'Login gagal';
    throw new Error(msg);
  }
  // Refresh cart token after successful login
  try {
    await regenerateCartToken();
  } catch {
    // ignore token refresh failure
  }
  // Notify listeners (e.g., header) that auth changed
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'));
  }
  return json;
}

export async function register(payload: RegisterPayload) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (json?.message as string) || 'Registrasi gagal';
    throw new Error(msg);
  }
  return json;
}

export async function logout() {
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    });
  } catch {
    // ignore
  }
  // After logout, drop any cached cart token and generate guest token
  try {
    resetCartTokenCache({ clearCookie: true });
    await regenerateCartToken();
  } catch {
    // ignore token refresh failure
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'));
  }
}

export async function me() {
  const res = await apiFetch('/api/auth/me', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'Gagal mengambil profil');
  return json; // { authenticated: boolean, user: {id,name,email}|null }
}
