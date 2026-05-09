import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Kiểm tra môi trường Localhost (Dùng host header cho chính xác)
  const host = request.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  if (isLocal) {
    return NextResponse.next();
  }

  // 2. Bảo vệ các route bắt đầu bằng /admin
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');
    
    // Nếu chưa đăng nhập (không có cookie 'admin_session')
    if (!session || session.value !== 'authenticated') {
      // Chuyển hướng sang trang login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Cấu hình matcher để chỉ chạy middleware trên các trang admin
export const config = {
  matcher: ['/admin/:path*'],
};
