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

export async function POST(req: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json({ status: "error", message: "API base URL not configured" }, { status: 500 });
  }

  const targetUrl = `${API_BASE}/api/auth/login`;

  let body: BodyInit | undefined;
  const ab = await req.arrayBuffer();
  body = ab.byteLength ? ab : undefined;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(targetUrl, { method: "POST", headers, body });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err?.message || "Upstream fetch failed" }, { status: 502 });
  }

  const payload = await upstreamResp.clone().json().catch(() => null);
  const normalized = (() => {
    try {
      const p: any = payload && typeof payload === 'object' ? { ...payload } : payload;
      if (p && p.data && typeof p.data === 'object' && p.data.access_token && !p.data.token) {
        p.data = { ...p.data, token: p.data.access_token };
      }
      return p ?? {};
    } catch {
      return payload ?? {};
    }
  })();

  // Remove any token from response body; cookie will carry it
  const sanitized = (() => {
    try {
      const c: any = normalized && typeof normalized === 'object' ? JSON.parse(JSON.stringify(normalized)) : {};
      if (c?.data) {
        delete c.data.token;
        delete c.data.access_token;
      }
      delete c.token;
      delete c.access_token;
      return c ?? {};
    } catch {
      return {};
    }
  })();

  const res = NextResponse.json(sanitized, { status: upstreamResp.status });
  res.headers.set('Cache-Control', 'no-store');

  try {
    const data = (payload as any)?.data;
    const token = data?.token;
    const prod = process.env.NODE_ENV === 'production';

    res.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: prod,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch {
    // ignore cookie set failure
  }

  return res;
}
