import { apiFetch } from '@/lib/apiFetch';

export async function fetchJson<T = unknown>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await apiFetch(url, options);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}
