import { NextRequest, NextResponse } from "next/server";

/** --- utils --- */
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

function getClientIp(req: NextRequest): string | undefined {
  // Urutan umum: x-forwarded-for (ip1, ip2, ...), ambil ip pertama
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return undefined;
}

/** --- envs --- */
const RAW_API_BASE = process.env.BACKEND_API_BASE_URL || "";
const API_BASE = normalizeBase(RAW_API_BASE);
const BFF_KEY = process.env.BFF_API_KEYS || "";

/** --- core handler --- */
async function handle(req: NextRequest, ctx: any) {
  if (!API_BASE) {
    return NextResponse.json(
      { status: "error", message: "API base URL not configured" },
      { status: 500 }
    );
  }

  // Map: /api/<...> -> <API_BASE>/api/<...>
  const resolved = (ctx?.params && typeof ctx.params.then === "function") ? await ctx.params : ctx?.params;
  const segments: string[] = Array.isArray(resolved?.path) ? resolved.path : [];
  const search = req.nextUrl.search || "";
  const targetPath = `api/${segments.join("/")}`.replace(/\/$/, "");
  const targetUrl = `${API_BASE}/${targetPath}${search}`;

  /** build outgoing headers */
  const outgoing = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (["host", "connection", "content-length"].includes(k)) return;
    if (k === "x-bff-auth") return; // prevent spoof
    if (k === "authorization") return; // never trust client Authorization
    outgoing.set(key, value);
  });
  // Default accept
  if (!outgoing.has("accept")) outgoing.set("Accept", "application/json");
  // Hindari double/invalid gzip dari upstream: minta uncompressed
  outgoing.set("Accept-Encoding", "identity");
  // BFF auth ke upstream (opsional)
  if (BFF_KEY) outgoing.set("X-BFF-Auth", BFF_KEY);

  // Inject X-Cart-Token dari cookie bila header kosong
  const isCartEndpoint = /^api\/v1\/cart(\b|\/)/.test(targetPath);
  if (isCartEndpoint && !outgoing.has("X-Cart-Token")) {
    const cartCookie = req.cookies.get("X-Cart-Token")?.value;
    if (cartCookie) outgoing.set("X-Cart-Token", cartCookie);
  }

  // Force Authorization Bearer hanya dari cookie server-managed
  outgoing.delete("Authorization");
  {
    const cookieAuth =
      req.cookies.get("token")?.value || req.cookies.get("access_token")?.value;
    if (cookieAuth) outgoing.set("Authorization", `Bearer ${cookieAuth}`);
  }

  // Forward IP dengan header (tanpa req.ip agar aman TS)
  const realIp = getClientIp(req);
  if (realIp) {
    outgoing.set("X-Real-IP", realIp);
    // Overwrite X-Forwarded-For with a single trusted IP
    outgoing.set("X-Forwarded-For", realIp);
  }

  /** CSRF check: block cross-site mutating requests when Origin is present */
  const method = req.method;
  const mutating = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (mutating) {
    const origin = req.headers.get("origin");
    if (origin) {
      const expectedOrigin = req.nextUrl.origin;
      if (origin !== expectedOrigin) {
        return NextResponse.json(
          { status: "error", message: "Invalid origin" },
          { status: 403 }
        );
      }
    }
  }

  /** body */
  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(method)) {
    const ab = await req.arrayBuffer();
    body = ab.byteLength ? ab : undefined;
  }

  /** timeout ringan */
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 12_000);

  /** fetch upstream */
  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method,
      headers: outgoing,
      body,
      redirect: "manual",
      signal: ac.signal,
    });
  } catch (err: any) {
    clearTimeout(to);
    const body: any = { status: "error", message: err?.message || "Upstream fetch failed" };
    if (process.env.NODE_ENV !== 'production') body.debugTarget = targetUrl;
    return NextResponse.json(body, { status: 502 });
  }
  clearTimeout(to);

  /** siapkan response headers ke client
   * buang content-encoding/length agar klien tidak mendekompresi salah
   */
  const respHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (["transfer-encoding", "content-length", "content-encoding"].includes(k)) return;
    respHeaders.append(key, value);
  });
  if (!respHeaders.has("cache-control")) {
    respHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  /** khusus: generate token -> simpan cookie */
  let parsedForCookie: any = null;
  try {
    const isGenerateToken = /^api\/v1\/cart\/token\/generate$/.test(targetPath);
    if (isGenerateToken && upstream.headers.get("content-type")?.includes("application/json")) {
      parsedForCookie = await upstream.clone().json().catch(() => null as any);
    }
  } catch {}

  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });

  // persist X-Cart-Token (3 hari)
  try {
    const token = parsedForCookie?.data?.token as string | undefined;
    if (token) {
      const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const prod = process.env.NODE_ENV === "production";
      res.cookies.set("X-Cart-Token", token, {
        httpOnly: true,
        secure: prod,
        sameSite: "strict",
        path: "/",
        expires,
      });
    }
  } catch {}

  return res;
}

/** export all HTTP verbs */
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;

// (opsional) bila ingin memaksa Node runtime untuk route ini:
// export const runtime = "nodejs";
