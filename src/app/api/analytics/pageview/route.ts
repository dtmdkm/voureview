import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PageView } from '@/models';

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return /ipad/i.test(ua) ? 'tablet' : 'mobile';
  return 'desktop';
}

function detectBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  if (/opera|opr/i.test(ua)) return 'Opera';
  return 'Other';
}

function detectOS(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad/i.test(ua)) return 'iOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function isBot(ua: string): boolean {
  return /bot|crawl|spider|slurp|mediapartners|googlebot|bingbot|yandex|baidu|facebot|ia_archiver|semrush|ahrefs|mj12|dotbot|headless/i.test(ua);
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const ua = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (isBot(ua)) return NextResponse.json({ ok: true });

    await PageView.create({
      storeId: body.storeId || undefined,
      path: body.path || '/',
      ip,
      sessionId: body.sessionId,
      deviceType: detectDevice(ua),
      browser: detectBrowser(ua),
      os: detectOS(ua),
      referrer: request.headers.get('referer') || '',
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
