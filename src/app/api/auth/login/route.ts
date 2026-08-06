import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password, remember } = await request.json();

    const adminUser = (process.env.ADMIN_USERNAME || process.env.ADMIN_USER || 'hoangca').trim();
    const adminPass = (process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'hoang@123').trim();

    console.log('[LOGIN ATTEMPT]', { providedUser: username, expectedUser: adminUser, providedPassLength: password.length, expectedPassLength: adminPass.length });

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
