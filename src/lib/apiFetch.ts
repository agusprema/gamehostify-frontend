/**
 * apiFetch: A thin wrapper around fetch that injects `X-BFF-Auth`
 * for requests targeting the configured backend base URL.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').toString();
  const bffKey = (process.env.NEXT_PUBLIC_BFF_API_KEYS ?? '').toString();

  // Resolve the URL string from various input types
  let urlStr: string;
  if (typeof input === 'string') {
    urlStr = input;
  } else if (typeof (input as any)?.url === 'string') {
    // Request or similar with a url property
    urlStr = (input as any).url as string;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else {
    urlStr = String(input);
  }

  // Merge headers and conditionally attach X-BFF-Auth
  const headers = new Headers(init.headers as HeadersInit | undefined);
  const shouldAttach = Boolean(apiBase) && urlStr.startsWith(apiBase) && Boolean(bffKey);
  if (shouldAttach && !headers.has('X-BFF-Auth')) {
    headers.set('X-BFF-Auth', bffKey);
  }

  return fetch(urlStr, { ...init, headers });
}

