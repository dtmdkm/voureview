import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/models';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    await connectToDatabase();
    const { currentPassword, newPassword } = await request.json();

    const stored = await Setting.findOne({ key: 'admin_password' });
    const current = stored?.value || process.env.ADMIN_PASSWORD || 'admin123';

    if (currentPassword !== current) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
    }

    await Setting.findOneAndUpdate(
      { key: 'admin_password' },
      { key: 'admin_password', value: newPassword },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
