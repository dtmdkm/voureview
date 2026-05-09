// Server Component - fetches data directly from MongoDB
import { connectToDatabase } from '@/lib/mongodb';
import { ActivityLog } from '@/models';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function AdminActivity() {
  await connectToDatabase();

  const rawLogs = await ActivityLog.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const logs = rawLogs.map((log: any) => ({
    ...log,
    _id: log._id.toString(),
    id: log._id.toString(),
    createdAt: log.createdAt?.toISOString() || null,
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Nhật ký hoạt động</h1>
          <p className="text-sm text-slate-500 font-medium">Lịch sử thao tác chi tiết của các quản trị viên trên hệ thống</p>
        </div>
        <Button variant="outline" asChild className="gap-2 h-11 px-5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">
          <Link href="/admin/activity"><RefreshCw className="h-4 w-4" />Làm mới</Link>
        </Button>
      </div>
      <ActivityClientPage initialLogs={logs} />
    </div>
  );
}
