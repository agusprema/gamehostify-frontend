import { NextRequest, NextResponse } from "next/server";
import { cookieDefaults, refreshCookieName, upstreamJson } from "@/app/api/_lib/upstream";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 422 });
    }

    // Forward to upstream
    type LoginUpstreamResponse = {
      data?: { token?: string; refresh_token?: string; user?: unknown };
      token?: string;
      refresh_token?: string;
      message?: string;
      [key: string]: unknown;
    };
    const { res, data } = await upstreamJson<LoginUpstreamResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Expect upstream to return refresh_token in body. If different, adjust here.
    const refreshToken: string | null = data?.data?.refresh_token ?? data?.refresh_token ?? null;
    if (!refreshToken) {
      // If your upstream sets HttpOnly cookie instead, adapt: parse and map here.
      return NextResponse.json({ message: "Upstream tidak mengembalikan refresh token" }, { status: 500 });
    }

    // Set HttpOnly refresh cookie on FE origin
    const resOut = NextResponse.json({
      status: "success",
      message: data?.message || "Login berhasil",
      data: {
        // Optionally forward user and access token to client
        token: data?.data?.token ?? data?.token ?? null,
        user: data?.data?.user ?? data?.user ?? null,
      },
    });
    resOut.cookies.set(refreshCookieName, refreshToken, {
      ...cookieDefaults,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return resOut;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Gagal memproses login" }, { status: 500 });
  }
}
