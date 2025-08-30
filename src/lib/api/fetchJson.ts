export async function fetchJson<T = unknown>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Failed to fetch');
    return (await res.json()) as T;
  } catch (e) {
    console.error(e);
    return null;
  }
}
