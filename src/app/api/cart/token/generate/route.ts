import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieDefaults, upstreamJson, refreshCookieName } from "@/app/api/_lib/upstream";

type CartTokenUpstream = {
  data?: { token?: string; expires_at?: string };
  message?: string;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {

  try {
    const store = await cookies();
    const cookieCartToken = store.get("X-Cart-Token")?.value ?? null;
    const AuthToken = store.get(refreshCookieName)?.value ?? null;
    let authHeader: Record<string, string> = {};

    if (AuthToken) authHeader = { 'Authorization': `Bearer ${AuthToken}` };

    const { res, data } = await upstreamJson<CartTokenUpstream>(
      "/api/v1/cart/token/generate",
      {
        method: "POST",
        headers: {
          ...authHeader,
          ...(cookieCartToken ? { "X-Cart-Token": cookieCartToken } : {}),
        },
      }
    );


    console.log(data);

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const token = data?.data?.token ?? null;
    const expiresAt = data?.data?.expires_at ?? null;
    const out = NextResponse.json(data, { status: 200 });

    if (token) {
      let maxAge: number | undefined = undefined;
      if (expiresAt) {
        const expMs = Date.parse(expiresAt);
        if (!Number.isNaN(expMs)) {
          const diffSec = Math.max(0, Math.floor((expMs - Date.now()) / 1000));
          maxAge = diffSec || undefined;
        }
      }
      out.cookies.set("X-Cart-Token", token, {
        ...cookieDefaults,
        // default 30 days if can't parse expiry
        maxAge: maxAge ?? 60 * 60 * 24 * 30,
      });
    }

    return out;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Gagal generate cart token" }, { status: 500 });
  }
}
