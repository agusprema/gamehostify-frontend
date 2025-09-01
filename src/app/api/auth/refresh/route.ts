import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieDefaults, refreshCookieName, upstreamJson } from "@/app/api/_lib/upstream";

export async function POST() {
  try {
    const store = await cookies();
    const rt = store.get(refreshCookieName)?.value;
    if (!rt) {
      return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
    }

    // Call upstream refresh. Support both cookie and body styles.
    type RefreshResponse = {
      data?: { token?: string; refresh_token?: string };
      token?: string;
      refresh_token?: string;
      message?: string;
      [key: string]: unknown;
    };
    const { res, data } = await upstreamJson<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: rt }),
      headers: {
        // Also send as cookie in case backend expects it that way
        Cookie: `refresh_token=${encodeURIComponent(rt)}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const newAccess: string | null = data?.data?.token ?? data?.token ?? null;
    const newRefresh: string | null = data?.data?.refresh_token ?? data?.refresh_token ?? null;
    const out = NextResponse.json({ data: { token: newAccess } }, { status: 200 });
    if (newRefresh) {
      out.cookies.set(refreshCookieName, newRefresh, {
        ...cookieDefaults,
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return out;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Gagal refresh token" }, { status: 500 });
  }
}
