import { apiFetch } from '@/lib/apiFetch';
import logger from '@/lib/logger';

export async function fetchJson<T = unknown>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await apiFetch(url, options);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (e) {
    logger.error(e);
    return null;
  }
}
