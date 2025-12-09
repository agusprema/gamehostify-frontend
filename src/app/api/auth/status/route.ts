import { NextRequest, NextResponse } from 'next/server';

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
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  // Try to fetch current user from backend if available
  if (API_BASE) {
    try {
      const upstream = await fetch(`${API_BASE}/api/user`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(BFF_KEY ? { 'X-BFF-Auth': BFF_KEY } : {}),
        },
      });
      const user = (await upstream.json().catch(() => null)) as unknown;
      if (upstream.ok && user) {
        // Normalize to id, name, email if wrapped
        const data: unknown = (user && typeof user === 'object')
          ? ((user as Record<string, unknown>).data ?? user)
          : user;
        const normalized = (data && typeof data === 'object') ? (() => {
          const obj = data as Record<string, unknown>;
          const id = ("id" in obj ? (obj.id as string | number | null | undefined) : null) ?? null;
          const name = ("name" in obj ? (obj.name as string | null | undefined) : null) ?? null;
          const email = ("email" in obj ? (obj.email as string | null | undefined) : null) ?? null;
          return { id, name, email };
        })() : { id: null, name: null, email: null };
        return NextResponse.json({ authenticated: true, user: normalized }, { status: 200 });
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ authenticated: true, user: null }, { status: 200 });
}

