/**
 * apiFetch: Route calls to backend via server-side proxy under `/api/...`.
 * Any URL that starts with configured API base is rewritten to the proxy path.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  // Normalize base (strip trailing slash)
  const rawBase = (
    process.env.BACKEND_API_BASE_URL ||
    ''
  ).toString();
  const apiBase = rawBase.replace(/\/$/, '');
  const isServer = typeof window === 'undefined';

  // Resolve the URL string from various input types
  let urlStr: string;
  if (typeof input === 'string') {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (typeof Request !== 'undefined' && input instanceof Request) {
    urlStr = input.url;
  } else {
    urlStr = String(input);
  }

  // If the URL targets the backend base, rewrite to server-side proxy
  let finalUrl = urlStr;
  if (apiBase && urlStr.startsWith(apiBase)) {
    try {
      const u = new URL(urlStr);
      // Keep the same path under /api to look clean
      finalUrl = `${u.pathname}${u.search}`;
    } catch {
      // Fallback: strip base prefix naively
      const stripped = urlStr.slice(apiBase.length).replace(/^\/+/, '');
      finalUrl = `/${stripped}`;
    }
  }

  // Fallback: tolerate missing env causing strings like `undefinedapi/...` or `api/...`
  if (!/^(https?:)?\/\//i.test(finalUrl)) {
    const m = finalUrl.match(/^\s*(?:undefined|null)?\/?(api\/.*)$/i);
    if (m && m[1]) {
      finalUrl = `/${m[1]}`;
    }
  }

  // On the server, make relative URL absolute using app base URL
  if (isServer && finalUrl.startsWith('/')) {
    let appBase = (
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.APP_URL ||
      process.env.VERCEL_URL ||
      ''
    ).toString();
    if (appBase && !/^https?:\/\//i.test(appBase)) {
      appBase = `https://${appBase}`;
    }
    appBase = appBase.replace(/\/$/, '');
    if (appBase) {
      finalUrl = `${appBase}${finalUrl}`;
    }
  }

  // Merge headers; ensure client never leaks X-BFF-Auth
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (headers.has('X-BFF-Auth')) headers.delete('X-BFF-Auth');
  // Never forward client Authorization to BFF; BFF derives from HttpOnly cookie
  if (headers.has('Authorization')) headers.delete('Authorization');

  return fetch(finalUrl, { ...init, headers });
}
