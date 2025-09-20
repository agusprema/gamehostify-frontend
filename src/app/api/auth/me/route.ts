import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function normalizeBase(url?: string | null) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const origin = u.origin;
    const pathname = u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname;
    return origin + pathname;
  } catch {
    return String(url).replace(/\/$/, '');
  }
}

const RAW_API_BASE = process.env.BACKEND_API_BASE_URL || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_BASE = normalizeBase(RAW_API_BASE);
const BFF_KEY = process.env.BFF_API_KEYS || '';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value || req.cookies.get('token')?.value;

  if (!token) {
    const res = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  if (!API_BASE) {
    // No upstream available; do not assert authentication
    const res = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  // Try preferred endpoint /api/auth/me then fallback to /api/user
  const candidates = [`${API_BASE}/api/auth/me`, `${API_BASE}/api/user`];
  for (const url of candidates) {
    try {
      const upstream = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(BFF_KEY ? { 'X-BFF-Auth': BFF_KEY } : {}),
        },
      });

      if (upstream.status === 401 || upstream.status === 403) {
        const res = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
        res.headers.set('Cache-Control', 'no-store');
        return res;
      }

      if (upstream.ok) {
        const json = (await upstream.json().catch(() => null)) as unknown;
        const data: unknown = (json && typeof json === 'object')
          ? ((json as Record<string, unknown>).data ?? (json as Record<string, unknown>).user ?? json)
          : json;
        const normalized = (data && typeof data === 'object') ? (() => {
          const obj = data as Record<string, unknown>;
          const id = ("id" in obj ? (obj.id as string | number | null | undefined) : null) ?? null;
          const name = ("name" in obj ? (obj.name as string | null | undefined) : null) ?? null;
          const email = ("email" in obj ? (obj.email as string | null | undefined) : null) ?? null;
          const avatar = ("avatar" in obj ? (obj.avatar as string | null | undefined) : null) ?? null;
          const birth_date = ("birth_date" in obj ? (obj.birth_date as string | null | undefined) : null) ?? null;
          const gender = ("gender" in obj ? (obj.gender as string | null | undefined) : null) ?? null;
          const phone = ("phone" in obj ? (obj.phone as string | null | undefined) : null) ?? null;
          return { id, name, email, avatar, birth_date, gender, phone };
        })() : null;
        const res = NextResponse.json({ authenticated: true, user: normalized }, { status: 200 });
        res.headers.set('Cache-Control', 'no-store');
        return res;
      }
    } catch {
      // try next candidate
    }
  }

  // Fallback if all attempts failed
  const res = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
