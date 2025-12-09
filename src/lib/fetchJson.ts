import { apiFetch } from '@/lib/apiFetch';
import logger from '@/lib/logger';

export async function fetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await apiFetch(url, options);

    let data: unknown = null;
    try {
      // Best-effort JSON parse; many APIs always respond with JSON
      data = await res.clone().json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      logger.error('fetchJson non-OK response', {
        url,
        status: res.status,
        statusText: res.statusText,
        body: data,
      });
      return null;
    }

    return data as T;
  } catch (e) {
    logger.error('fetchJson request failed', e);
    return null;
  }
}
