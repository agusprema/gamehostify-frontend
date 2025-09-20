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

  const targetUrl = `${API_BASE}/api/auth/refresh`;

  // Build headers for upstream
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (BFF_KEY) headers.set("X-BFF-Auth", BFF_KEY);

  const bearer = req.cookies.get('access_token')?.value || req.cookies.get('token')?.value;
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(targetUrl, { method: "POST", headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upstream fetch failed";
    return NextResponse.json({ status: "error", message }, { status: 502 });
  }

  type RefreshPayload = {
    status?: string;
    message?: string;
    data?: {
      token?: string | null;
      access_token?: string | null;
      user?: unknown;
      [k: string]: unknown;
    } | null;
    [k: string]: unknown;
  } | null;

  const payload = (await upstreamResp.clone().json().catch(() => null)) as RefreshPayload;

  // Sanitize: strip token fields from body; cookie will carry it
  const sanitized = (() => {
    try {
      const c: RefreshPayload = payload && typeof payload === 'object'
        ? (JSON.parse(JSON.stringify(payload)) as RefreshPayload)
        : {};
      if (c && typeof c === 'object' && c.data && typeof c.data === 'object') {
        delete (c.data as Record<string, unknown>).token;
        delete (c.data as Record<string, unknown>).access_token;
      }
      return c ?? {};
    } catch {
      return payload ?? {};
    }
  })();

  const res = NextResponse.json(sanitized ?? {}, { status: upstreamResp.status });
  res.headers.set('Cache-Control', 'no-store');

  // Persist new token if present
  try {
    const token = (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object')
      ? (typeof payload.data.token === 'string'
          ? payload.data.token
          : (typeof (payload.data as { access_token?: unknown }).access_token === 'string'
              ? (payload.data as { access_token?: string }).access_token
              : undefined))
      : undefined;
    if (typeof token === 'string' && token) {
      const prod = process.env.NODE_ENV === 'production';
      res.cookies.set('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: prod,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch {
    // ignore cookie failure
  }

  return res;
}
