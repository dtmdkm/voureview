// Server Component — the main admin dashboard, fetches all data in parallel from MongoDB
import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal, Category, BlogPost, PageView } from '@/models';
import Link from 'next/link';
import { Store as StoreIcon, Tag, FolderOpen, FileText, ArrowRight, TrendingUp, Eye, MousePointerClick, Activity, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export default async function AdminDashboard() {
  await connectToDatabase();

  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);

  const [storeCount, dealCount, categoryCount, blogCount, totalViews, uniqueVisitorsArr, totalClicksAgg, topDeals, recentDeals] = await Promise.all([
    Store.countDocuments(),
    Deal.countDocuments(),
    Category.countDocuments(),
    BlogPost.countDocuments(),
    PageView.countDocuments({ createdAt: { $gte: since7 }, isBot: { $ne: true } }),
    PageView.distinct('sessionId', { createdAt: { $gte: since7 }, isBot: { $ne: true } }),
    Deal.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }]),
    Deal.find({}).select('title clicks storeId').sort({ clicks: -1 }).limit(5).populate('storeId', 'name').lean(),
    Deal.find({}).select('title createdAt type').sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const uniqueVisitors = uniqueVisitorsArr.length;
  const totalClicks = totalClicksAgg[0]?.total || 0;

  const mainCards = [
    { href: '/admin/stores', label: 'Stores', value: storeCount, icon: StoreIcon, color: 'text-[#001d5e]', bg: 'bg-[#e8edf7]' },
    { href: '/admin/deals', label: 'Deals & Codes', value: dealCount, icon: Tag, color: 'text-[#eb004a]', bg: 'bg-rose-50' },
    { href: '/admin/categories', label: 'Categories', value: categoryCount, icon: FolderOpen, color: 'text-[#001d5e]', bg: 'bg-[#e8edf7]' },
    { href: '/admin/blog', label: 'Blog Posts', value: blogCount, icon: FileText, color: 'text-[#eb004a]', bg: 'bg-rose-50' },
  ];

  const analyticsCards = [
    { label: 'Page Views (7d)', value: totalViews, icon: Eye, color: 'text-[#001d5e]', bg: 'bg-[#e8edf7]', trend: '+12%' },
    { label: 'Unique Visitors', value: uniqueVisitors, icon: TrendingUp, color: 'text-[#001d5e]', bg: 'bg-[#e8edf7]', trend: '+8%' },
    { label: 'Total Deal Clicks', value: totalClicks, icon: MousePointerClick, color: 'text-[#eb004a]', bg: 'bg-rose-50', trend: '+24%' },
  ];

  const deals = topDeals.map((d: any) => ({
    _id: d._id.toString(),
    title: d.title,
    clicks: d.clicks || 0,
    storeName: (d.storeId as any)?.name || '—',
  }));

  const recent = recentDeals.map((d: any) => ({
    _id: d._id.toString(),
    title: d.title,
    createdAt: d.createdAt?.toISOString() || null,
    type: d.type || 'deal',
  }));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Dashboard</h1>
        <p className="text-[14px] text-slate-500 mt-1 font-medium">Welcome back! Here is a summary of your site performance over the last 7 days.</p>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {mainCards.map(({ href, label, value, icon: Icon, color, bg }) => (
          <Link key={label} href={href} className="group bg-white rounded-[20px] border border-slate-100 p-10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block relative min-h-[160px] flex flex-col justify-between">
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div className="mt-auto">
              <p className="text-[32px] font-black text-slate-900 leading-none tracking-tight mb-2 pr-6">{value.toLocaleString()}</p>
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pr-6">{label}</p>
            </div>
            <ChevronRight className="absolute right-6 bottom-10 h-5 w-5 text-slate-300 group-hover:text-[#001d5e] group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {analyticsCards.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="bg-white rounded-[20px] border border-slate-100 p-10 shadow-sm hover:shadow-md transition-all flex items-center gap-6 min-h-[120px]">
            <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
              <Icon className={`h-7 w-7 ${color}`} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-[26px] font-black text-slate-900 leading-none">{value.toLocaleString()}</p>
            </div>
            <div className="text-[11px] font-black text-[#001d5e] bg-[#e8edf7] px-3 py-1.5 rounded-xl border border-[#c5d0e8]">{trend}</div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Deals */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight">Top Deals by Clicks</h3>
            <Link href="/admin/deals" className="text-[12px] text-[#001d5e] font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {deals.map((deal, i) => (
              <div key={deal._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-[#001d5e] group-hover:text-white transition-all shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-[#001d5e] transition-colors">{deal.title}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{deal.storeName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-black text-slate-900">{deal.clicks.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">clicks</p>
                </div>
              </div>
            ))}
            {!deals.length && (
              <div className="py-12 flex flex-col items-center opacity-40">
                <Activity className="w-10 h-10 mb-3" />
                <p className="font-bold text-sm">No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight">Latest Deals</h3>
            <Link href="/admin/deals" className="text-[12px] text-[#001d5e] font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((deal) => (
              <div key={deal._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
                <div className="w-7 h-7 rounded-lg bg-[#e8edf7] flex items-center justify-center shrink-0">
                  <Tag className="h-3.5 w-3.5 text-[#001d5e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{deal.title}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString('en-US') : '—'}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#e8edf7] text-[#001d5e] shrink-0">
                  {deal.type === 'code' ? 'Code' : 'Deal'}
                </span>
              </div>
            ))}
            {!recent.length && (
              <div className="py-12 flex flex-col items-center opacity-40">
                <Tag className="w-10 h-10 mb-3" />
                <p className="font-bold text-sm">No deals yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
