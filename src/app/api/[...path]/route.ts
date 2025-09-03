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

const RAW_API_BASE = process.env.BACKEND_API_BASE_URL || "";
const API_BASE = normalizeBase(RAW_API_BASE);
const BFF_KEY = process.env.BFF_API_KEYS || "";

async function handle(req: NextRequest, ctx: any) {
  if (!API_BASE) {
    return NextResponse.json({ status: "error", message: "API base URL not configured" }, { status: 500 });
  }

  // For route: /api/<...path> → upstream: <API_BASE>/api/<...path>
  const resolved = (ctx?.params && typeof ctx.params.then === "function") ? await ctx.params : ctx?.params;
  const segments: string[] = Array.isArray(resolved?.path) ? resolved.path : [];
  const search = req.nextUrl.search || "";
  const targetPath = `api/${segments.join("/")}`.replace(/\/$/, "");
  const targetUrl = `${API_BASE}/${targetPath}${search}`;

  const outgoingHeaders = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (["host", "connection", "content-length"].includes(k)) return;
    if (k === "x-bff-auth") return;
    outgoingHeaders.set(key, value);
  });
  if (BFF_KEY) outgoingHeaders.set("X-BFF-Auth", BFF_KEY);

  // Inject X-Cart-Token from cookie when header missing for any cart endpoints
  const isCartEndpoint = /^api\/v1\/cart(\b|\/)/.test(targetPath);
  if (isCartEndpoint) {
    const current = outgoingHeaders.get('X-Cart-Token');
    if (!current) {
      const cartCookie = req.cookies.get('X-Cart-Token')?.value;
      if (cartCookie) {
        outgoingHeaders.set('X-Cart-Token', cartCookie);
      }
    }
  }

  // Inject Authorization from cookie when header missing
  if (!outgoingHeaders.has('Authorization')) {
    const cookieAuth = req.cookies.get('token')?.value;
    if (cookieAuth) { outgoingHeaders.set('Authorization', `Bearer ${cookieAuth}`); }
  }

  const method = req.method;
  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(method)) {
    const ab = await req.arrayBuffer();
    body = ab.byteLength ? ab : undefined;
  }

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(targetUrl, { method, headers: outgoingHeaders, body, redirect: "manual" });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err?.message || "Upstream fetch failed" }, { status: 502 });
  }

  const respHeaders = new Headers();
  upstreamResp.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // Preserve content-encoding so the client can decompress the streamed body
    if (["transfer-encoding", "content-length"].includes(k)) return;
    respHeaders.append(key, value);
  });

  // Optionally parse JSON before streaming out, so reading body remains safe
  let parsedForCookie: any = null;
  try {
    const isGenerateToken = /^api\/v1\/cart\/token\/generate$/.test(targetPath);
    if (isGenerateToken && upstreamResp.headers.get('content-type')?.includes('application/json')) {
      parsedForCookie = await upstreamResp.clone().json().catch(() => null as any);
    }
  } catch {}

  const res = new NextResponse(upstreamResp.body, {
    status: upstreamResp.status,
    statusText: upstreamResp.statusText,
    headers: respHeaders,
  });

  // When hitting cart token generate endpoint, persist token to HTTP cookie (3 days)
  try {
    const token = parsedForCookie?.data?.token as string | undefined;
    if (token) {
      const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
      const prod = process.env.NODE_ENV === 'production';
      res.cookies.set('X-Cart-Token', token, {
        httpOnly: true,
        secure: prod,
        sameSite: 'lax',
        path: '/',
        expires,
      });
    }
  } catch {}

  return res;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
