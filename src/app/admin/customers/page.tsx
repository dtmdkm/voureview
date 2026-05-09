import { RefreshCw } from 'lucide-react';
import { connectToDatabase } from '@/lib/mongodb';
import { CustomerLead } from '@/models';
import ClientPage from './ClientPage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Prevent static caching to always show fresh data

export default async function AdminCustomers() {
  // 1. Connect to DB and fetch directly on the Server
  await connectToDatabase();
  
  // Mongoose lean() returns plain JS objects which are fast and serializable
  const rawLeads = await CustomerLead.find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const total = await CustomerLead.countDocuments();

  // Clean up MongoDB _id to string for Next.js serialization
  const leads = rawLeads.map((lead: any) => ({
    ...lead,
    _id: lead._id.toString(),
    id: lead._id.toString(),
    createdAt: lead.createdAt?.toISOString() || null,
    updatedAt: lead.updatedAt?.toISOString() || null,
  }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header rendered on Server instantly */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Quản lý Khách hàng</h1>
          <p className="text-sm text-slate-500 font-medium">Theo dõi và phản hồi các yêu cầu liên hệ từ người dùng</p>
        </div>
        
        {/* We use a Link to refresh the server component page */}
        <Button 
          variant="outline" 
          asChild
          className="gap-2 h-11 px-5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold"
        >
          <Link href="/admin/customers">
             <RefreshCw className="h-4 w-4" />
             Làm mới dữ liệu
          </Link>
        </Button>
      </div>

      {/* Interactive parts rendered by Client Component */}
      <ClientPage initialLeads={leads} total={total} />
    </div>
  );
}
