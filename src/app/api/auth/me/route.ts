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

export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value || req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  if (!API_BASE) {
    // No upstream available; still indicate authenticated due to token presence
    return NextResponse.json({ authenticated: true, user: null }, { status: 200 });
  }

  // Try preferred endpoint /api/auth/me then fallback to /api/user
  const candidates = [`${API_BASE}/api/auth/me`, `${API_BASE}/api/user`];
  for (const url of candidates) {
    try {
      const upstream = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (upstream.status === 401 || upstream.status === 403) {
        return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
      }

      if (upstream.ok) {
        const json = await upstream.json().catch(() => null);
        const data = (json as any)?.data ?? (json as any)?.user ?? json;
        const normalized = data && typeof data === 'object' ? {
          id: (data as any)?.id ?? null,
          name: (data as any)?.name ?? null,
          email: (data as any)?.email ?? null,
        } : null;
        return NextResponse.json({ authenticated: true, user: normalized }, { status: 200 });
      }
    } catch {
      // try next candidate
    }
  }

  // Fallback if all attempts failed but token exists
  return NextResponse.json({ authenticated: true, user: null }, { status: 200 });
}
