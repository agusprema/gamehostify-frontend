import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { upstreamJson } from "@/app/api/_lib/upstream";

async function forwardMe(accessToken?: string, cartToken?: string) {
  const { res, data } = await upstreamJson("/api/auth/me", {
    method: "GET",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cartToken ? { "X-Cart-Token": cartToken } : {}),
    },
  });
  return { res, data };
}

export async function GET(req: NextRequest) {
  const store = await cookies();
  const cartToken = store.get("X-Cart-Token")?.value;
  // Try with provided Authorization header first
  const auth = req.headers.get("authorization") || undefined;
  const token = auth?.startsWith("Bearer ") ? auth.substring(7) : undefined;
  let { res, data } = await forwardMe(token, cartToken);
  if (res.status === 401) {
    // Try refresh via our own refresh endpoint
    const refreshRes = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const refreshJson = await refreshRes.json().catch(() => ({}));
      const newToken: string | undefined = refreshJson?.data?.token;
      if (newToken) {
        const result = await forwardMe(newToken, cartToken);
        res = result.res;
        data = result.data;
      }
    }
  }
  return NextResponse.json(data, { status: res.status });
}
