import { NextRequest, NextResponse } from "next/server";

function normalizeBase(url?: string | null) {
  if (!url) return "";
  try {
    const u = new URL(url);
    const origin = u.origin;
    const pathname = u.pathname.endsWith("/") ? u.pathname.slice(0, -1) : u.pathname;
    return origin + pathname;
  } catch {
    return String(url).replace(/\/$/, "");
  }
}

const RAW_API_BASE = process.env.BACKEND_API_BASE_URL || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_BASE = normalizeBase(RAW_API_BASE);
const BFF_KEY = process.env.BFF_API_KEYS || "";

export async function POST(req: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json({ status: "error", message: "API base URL not configured" }, { status: 500 });
  }

  const targetUrl = `${API_BASE}/api/auth/login`;

  const ab = await req.arrayBuffer();
  const body: BodyInit | undefined = ab.byteLength ? ab : undefined;

  const headers = new Headers();
  // Always send JSON accept; copy content-type if provided by client
  headers.set("Accept", "application/json");
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  // Avoid forwarding hop-by-hop headers and client auth
  // Provide BFF key to upstream if configured
  if (BFF_KEY) headers.set("X-BFF-Auth", BFF_KEY);

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(targetUrl, { method: "POST", headers, body });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upstream fetch failed";
    return NextResponse.json({ status: "error", message }, { status: 502 });
  }

  type LoginPayload = {
    data?: {
      access_token?: string;
      token?: string;
      [k: string]: unknown;
    };
    token?: string;
    access_token?: string;
    [k: string]: unknown;
  } | null;

  const payload = (await upstreamResp.clone().json().catch(() => null)) as LoginPayload;
  const normalized: LoginPayload = (() => {
    try {
      const p = payload && typeof payload === 'object' ? { ...payload } : payload;
      if (p && typeof p === 'object' && p.data && typeof p.data === 'object' && p.data.access_token && !p.data.token) {
        p.data = { ...p.data, token: p.data.access_token };
      }
      return (p as LoginPayload) ?? {};
    } catch {
      return payload ?? {};
    }
  })();

  // Remove any token from response body; cookie will carry it
  const sanitized = (() => {
    try {
      const c: LoginPayload = normalized && typeof normalized === 'object'
        ? (JSON.parse(JSON.stringify(normalized)) as LoginPayload)
        : {};
      if (c && typeof c === 'object' && c.data) {
        delete c.data.token;
        delete c.data.access_token;
      }
      if (c && typeof c === 'object') {
        delete c.token;
        delete c.access_token;
      }
      return c ?? {};
    } catch {
      return {};
    }
  })();

  const res = NextResponse.json(sanitized, { status: upstreamResp.status });
  res.headers.set('Cache-Control', 'no-store');

  try {
    const token = (payload && typeof payload === 'object')
      ? (payload?.data?.token || payload?.token || payload?.access_token)
      : undefined;
    if (typeof token === 'string' && token) {
      // Derive secure flag from actual request scheme
      const forwardedProto = req.headers.get('x-forwarded-proto');
      const proto = forwardedProto ? forwardedProto.split(',')[0].trim() : req.nextUrl.protocol.replace(':', '');
      const isHttps = proto === 'https';
      const cookieOpts = {
        httpOnly: true as const,
        sameSite: 'strict' as const,
        secure: isHttps,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      };
      // Set only our canonical cookie name
      res.cookies.set('token', token, cookieOpts);
    }
  } catch {
    // ignore cookie set failure
  }

  return res;
}
