import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { upstreamJson } from "@/app/api/_lib/upstream";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const store = await cookies();
    const cartToken = store.get("X-Cart-Token")?.value;
    const { res, data } = await upstreamJson("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: cartToken ? { "X-Cart-Token": cartToken } : {},
    });
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Gagal memproses register" }, { status: 500 });
  }
}
