import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ status: 'success', message: 'Logged out', data: null });
  const prod = process.env.NODE_ENV === 'production';
  res.headers.set('Cache-Control', 'no-store');
  res.cookies.set('token', '', { httpOnly: true, sameSite: 'strict', secure: prod, path: '/', maxAge: 0 });
  return res;
}

