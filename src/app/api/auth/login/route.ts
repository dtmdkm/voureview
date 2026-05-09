import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password, remember } = await request.json();

    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'bobo2026';

    if (username === adminUser && password === adminPass) {
      const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 24 hours
      
      (await cookies()).set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống!' }, { status: 500 });
  }
}
