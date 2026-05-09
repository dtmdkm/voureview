import { connectToDatabase } from '@/lib/mongodb';
import { Store, Deal } from '@/models';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const revalidate = 3600; // Static with 1h ISR

export default async function AdminStoreStats() {
  await connectToDatabase();

  // Optimized aggregation pipeline: joins Store with Deals and calculates clicks in DB
  const storeStatsRaw = await Store.aggregate([
    {
      $lookup: {
        from: 'deals', // The collection name for Deal model
        localField: '_id',
        foreignField: 'storeId',
        as: 'deals'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        image: 1,
        status: 1,
        dealCount: { $size: '$deals' },
        totalClicks: { $sum: '$deals.clicks' }
      }
    },
    { $sort: { totalClicks: -1 } }
  ]);

  const storeStats = storeStatsRaw.map(s => ({
    ...s,
    id: s._id.toString(),
  }));

  const totalAllClicks = storeStats.reduce((s, st) => s + (st.totalClicks || 0), 0);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Thống kê chiến dịch
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Hiệu suất click theo từng cửa hàng</p>
        </div>
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-orange-50 border border-orange-100/50 rounded-2xl text-orange-600 font-black text-sm uppercase tracking-widest shadow-sm">
          <TrendingUp className="h-4 w-4" />
          Tổng {totalAllClicks.toLocaleString()} clicks
        </div>
      </div>

      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">STT</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[240px]">Cửa hàng / Slug</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Deals</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40 text-center">Tổng Clicks</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right w-32 pr-8">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {storeStats.map((store: any, i: number) => (
                <tr key={store.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-slate-300 text-center">{i + 1}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {store.image ? (
                        <div className="w-10 h-10 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden p-0.5 shrink-0">
                          <img src={store.image} className="w-full h-full object-contain" alt="" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black border border-slate-200/50 shrink-0">S</div>
                      )}
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-[14px] leading-tight group-hover:text-indigo-600 transition-colors">{store.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 font-medium">{store.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                      {store.dealCount}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100/50">
                      {store.totalClicks.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Badge variant={store.status === 'active' ? 'success' : 'secondary'} className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      {store.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 pr-8 text-right">
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" asChild>
                      <a href={`/store/${store.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
