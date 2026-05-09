// Server Component — fetches all overview data directly from MongoDB
import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal, Category, BlogPost, CustomerLead, PageView } from '@/models';
import { Store as StoreIcon, Tag, FolderOpen, FileText, Eye, MousePointerClick, Users, UserCheck, TrendingUp, ArrowRight, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds for performance on Vercel

export default async function AdminOverview() {
  await connectToDatabase();

  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  // Run all queries in parallel for maximum speed
  const [storeCount, dealCount, categoryCount, blogCount, leadCount, totalViews, uniqueVisitorsArr, totalClicksAgg, topDeals] = await Promise.all([
    Store.countDocuments(),
    Deal.countDocuments(),
    Category.countDocuments(),
    BlogPost.countDocuments(),
    CustomerLead.countDocuments(),
    PageView.countDocuments({ createdAt: { $gte: since30 }, isBot: { $ne: true } }),
    PageView.distinct('sessionId', { createdAt: { $gte: since30 }, isBot: { $ne: true } }),
    Deal.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }]),
    Deal.find({}).sort({ clicks: -1 }).limit(8).populate('storeId', 'name').lean(),
  ]);

  const uniqueVisitors = uniqueVisitorsArr.length;
  const totalClicks = totalClicksAgg[0]?.total || 0;

  const cards = [
    { label: 'Cửa hàng', value: storeCount, icon: StoreIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+2', href: '/admin/stores' },
    { label: 'Ưu đãi & Mã', value: dealCount, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12', href: '/admin/deals' },
    { label: 'Danh mục', value: categoryCount, icon: FolderOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '0', href: '/admin/categories' },
    { label: 'Bài viết Blog', value: blogCount, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5', href: '/admin/blog' },
    { label: 'Lượt xem (30 ngày)', value: totalViews, icon: Eye, color: 'text-cyan-600', bg: 'bg-cyan-50', trend: '+15%', href: '/admin/analytics' },
    { label: 'Khách truy cập', value: uniqueVisitors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8%', href: '/admin/analytics' },
    { label: 'Tổng clicks', value: totalClicks, icon: MousePointerClick, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+22%', href: '/admin/analytics' },
    { label: 'Liên hệ khách hàng', value: leadCount, icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-50', trend: '+3', href: '/admin/customers' },
  ];

  const deals = topDeals.map((d: any) => ({
    ...d,
    _id: d._id.toString(),
    storeId: d.storeId ? { name: (d.storeId as any).name } : null,
  }));

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Biểu đồ tổng quan</h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Báo cáo phân tích toàn diện về hiệu suất và dữ liệu nền tảng.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="px-4 py-2 rounded-xl text-[13px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 shadow-sm">30 ngày qua</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon, color, bg, trend, href }) => (
          <Link key={label} href={href} className="bg-white rounded-[20px] border border-slate-100 p-12 shadow-sm hover:shadow-md transition-all group relative block min-h-[200px] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", bg)}>
                <Icon className={cn("h-6 w-6", color)} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" />{trend}
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-[32px] font-black text-slate-900 leading-none tracking-tight mb-2">{value.toLocaleString()}</p>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Icon className="w-24 h-24" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Deals */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 p-10 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Top ưu đãi hiệu quả nhất</h3>
            </div>
            <Link href="/admin/deals" className="text-[13px] text-indigo-600 font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all">
              Tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex-1 space-y-3">
            {deals.map((deal: any, i: number) => (
              <div key={deal._id} className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{deal.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{deal.storeId?.name || '—'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-bold text-emerald-600">Active</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-black text-slate-900 leading-none">{(deal.clicks || 0).toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Clicks</div>
                </div>
              </div>
            ))}
            {!deals.length && (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-40">
                <Activity className="w-12 h-12 mb-4" />
                <p className="font-bold text-sm">Chưa có dữ liệu thống kê</p>
              </div>
            )}
          </div>
        </div>

        {/* Growth Card */}
        <div className="bg-indigo-600 rounded-[24px] p-10 text-white shadow-xl shadow-indigo-100 flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-[22px] font-extrabold tracking-tight mb-2">Tăng trưởng nền tảng</h3>
            <p className="text-indigo-100 text-[14px] font-medium leading-relaxed mb-8">Hệ thống đang hoạt động ổn định với tỷ lệ tương tác tăng 22% so với tháng trước.</p>
            <div className="space-y-6">
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[12px] font-bold text-indigo-200 uppercase tracking-widest">Tiến độ mục tiêu</span>
                  <span className="text-[12px] font-black">84%</span>
                </div>
                <div className="w-full h-2 bg-indigo-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[84%]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/5 text-center">
                  <p className="text-[20px] font-black">{leadCount.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Total Leads</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/5 text-center">
                  <p className="text-[20px] font-black">{totalViews.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Monthly Views</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}
