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

  const targetUrl = `${API_BASE}/api/auth/register`;

  const ab = await req.arrayBuffer();
  const body = ab.byteLength ? ab : undefined;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(targetUrl, { method: 'POST', headers, body });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err?.message || 'Upstream fetch failed' }, { status: 502 });
  }

  const isJsonWanted = (req.headers.get('accept') || '').includes('application/json');
  const payload = await upstreamResp.clone().json().catch(() => null);

  if (!isJsonWanted && upstreamResp.ok) {
    // After successful register, redirect to frontend login page
    const loginUrl = new URL('/login', req.nextUrl);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  return NextResponse.json(payload ?? {}, { status: upstreamResp.status });
}
