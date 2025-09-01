import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieDefaults, refreshCookieName, upstreamJson } from "@/app/api/_lib/upstream";

export async function POST() {
  try {
    const store = await cookies();
    const rt = store.get(refreshCookieName)?.value;
    if (rt) {
      await upstreamJson("/auth/logout", {
        method: "POST",
        headers: { Cookie: `refresh_token=${encodeURIComponent(rt)}` },
      }).catch(() => undefined);
    }
    const out = NextResponse.json({ status: "success" }, { status: 200 });
    out.cookies.set(refreshCookieName, "", { ...cookieDefaults, maxAge: 0 });
    return out;
  } catch (e) {
    console.error(e);
    const out = NextResponse.json({ status: "success" }, { status: 200 });
    out.cookies.set(refreshCookieName, "", { ...cookieDefaults, maxAge: 0 });
    return out;
  }
}
