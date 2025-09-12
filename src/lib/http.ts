import { apiFetch } from '@/lib/apiFetch';
import { handleApiErrors } from '@/utils/apiErrorHandler';

export type ApiClientError = Error & {
  status?: number;
  fields?: Record<string, string[]> | null;
  raw?: unknown;
};

async function parseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(url, init);
  const json = await parseJson(res);
  if (!res.ok) {
    const { message, fields } = handleApiErrors(json);
    const err: ApiClientError = Object.assign(new Error(message), {
      status: res.status,
      fields: fields ?? null,
      raw: json,
    });
    throw err;
  }
  return json as T;
}

