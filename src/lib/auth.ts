import { apiFetch } from '@/lib/apiFetch';
import { regenerateCartToken, resetCartTokenCache } from '@/lib/cart/getCartToken';
import { apiRequest } from '@/lib/http';

type LoginPayload = { email: string; password: string };

type RegisterPayload = { 
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  birth_date: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
};

export async function login(payload: LoginPayload) {
  const json = await apiRequest<any>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
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
  return apiRequest<any>('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
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
  return apiRequest<any>('/api/auth/me', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
}
