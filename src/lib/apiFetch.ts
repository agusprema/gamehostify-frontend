/**
 * apiFetch: Route calls to backend via server-side proxy under `/api/...`.
 * Any URL that starts with configured API base is rewritten to the proxy path.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  // Normalize base (strip trailing slash)
  const rawBase = (process.env.NEXT_PUBLIC_BASE_URL || "").toString();
  const apiBase = rawBase.replace(/\/$/, '');
  const isServer = typeof window === 'undefined';

  // Helper to read a named cookie (client-side only)
  const getCookie = (name: string): string | null => {
    if (isServer || typeof document === 'undefined') return null;
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([$?*|{}\]\\/\+^])/g, '\\$1') + '=([^;]*)')
    );
    return match ? match[1] : null;
  };

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

  // Track internal API calls (`/api/...`) on the server so we can
  // safely attach the BFF key when talking directly to the backend.
  const isServerInternalApi = isServer && /^\/api\//.test(finalUrl);

  // On the server, resolve internal `/api/...` calls directly against the
  // configured backend base URL so we don't depend on a local Next server
  // (e.g. during `next build` / static export).
  if (isServerInternalApi) {
    const rawBackendBase =
      process.env.BACKEND_API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      '';
    const backendBase = rawBackendBase.toString().replace(/\/$/, '');
    if (backendBase) {
      const path = finalUrl.replace(/^\/+/, '');
      finalUrl = `${backendBase}/${path}`;
    }
  }

  // Merge headers; ensure client never leaks X-BFF-Auth
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (headers.has('X-BFF-Auth')) headers.delete('X-BFF-Auth');
  // Never forward client Authorization to BFF; BFF derives from HttpOnly cookie
  if (headers.has('Authorization')) headers.delete('Authorization');

  // Attach CSRF/XSRF token from cookie for browser requests (e.g. Laravel Sanctum)
  if (!isServer) {
    const xsrfCookie = getCookie('XSRF-TOKEN');
    if (xsrfCookie && !headers.has('X-XSRF-TOKEN')) {
      headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfCookie));
    }
  }

  // For server-side internal API calls that we rewrote to hit the backend
  // directly, attach the BFF key so the upstream accepts the request.
  if (isServerInternalApi) {
    const bffKey = process.env.BFF_API_KEYS;
    if (bffKey && !headers.has('X-BFF-Auth')) {
      headers.set('X-BFF-Auth', bffKey);
    }
  }

  // Ensure cookies (session, XSRF-TOKEN, etc.) are sent by default
  const credentials = init.credentials ?? 'include';

  return fetch(finalUrl, { ...init, headers, credentials });
}
