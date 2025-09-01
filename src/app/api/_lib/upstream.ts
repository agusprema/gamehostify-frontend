function normalizeBase(url: string | undefined | null): string {
  if (!url) return "";
  return url.replace(/\/$/, "");
}

export function getUpstreamBase(): string {
  // Prefer private server envs; fallback to public if needed
  const base = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL);
  if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL env");
  return base;
}

export async function upstreamJson<T = unknown>(
  path: string,
  init?: RequestInit & { headers?: HeadersInit }
): Promise<{ res: Response; data: T }> {
  const base = getUpstreamBase();
  const url = base + (path.startsWith("/") ? path : `/${path}`);
  const merged = new Headers({
    Accept: "application/json",
  });
  if (init?.headers) {
    const extra = new Headers(init.headers);
    extra.forEach((v, k) => merged.set(k, v));
  }
  // Only set JSON Content-Type if a body is present and caller
  // didn't explicitly set a Content-Type header.
  const hasBody = typeof init?.body !== "undefined" && init?.body !== null;
  if (hasBody && !merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }
  const bffKey = process.env.BFF_API_KEYS;
  if (bffKey) merged.set("X-BFF-Auth", bffKey);
  const res = await fetch(url, { ...init, headers: merged });
  const contentType = res.headers.get("content-type") || "";
  let data: unknown;
  if (contentType.includes("application/json")) {
    data = await res
      .json()
      .catch(() => ({ message: "Invalid JSON from upstream" }));
  } else if (res.status === 204 || res.status === 205) {
    data = {};
  } else {
    const text = await res.text().catch(() => "");
    data = text ? { message: text } : {};
  }
  return { res, data: data as T };
}

export const isProd = process.env.NODE_ENV === "production";

export const cookieDefaults = {
  httpOnly: true as const,
  path: "/",
  sameSite: "lax" as const,
  secure: isProd,
};

export const refreshCookieName = process.env.BFF_REFRESH_COOKIE_NAME || "bff_rt";
