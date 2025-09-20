import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ status: 'success', message: 'Logged out', data: null });
  res.headers.set('Cache-Control', 'no-store');
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const proto = forwardedProto ? forwardedProto.split(',')[0].trim() : req.nextUrl.protocol.replace(':', '');
  const isHttps = proto === 'https';
  res.cookies.set('token', '', { httpOnly: true, sameSite: 'strict', secure: isHttps, path: '/', maxAge: 0 });
  return res;
}
