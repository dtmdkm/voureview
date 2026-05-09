'use client';

import { useState, useTransition } from 'react';
import { Eye, MousePointerClick, Users, RefreshCw, Smartphone, Globe, Layers, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyticsClientPage({ initialStats, initialDays }: { initialStats: any, initialDays: number }) {
  const [stats, setStats] = useState<any>(initialStats);
  const [days, setDays] = useState(initialDays);
  const [isPending, startTransition] = useTransition();

  const fetchStats = async (d: number) => {
    setDays(d);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/analytics/stats?days=${d}`);
        const data = await res.json();
        setStats(data);
      } catch (err) { console.error(err); }
    });
  };

  const statCards = [
    { label: 'Lượt xem trang', value: stats?.totalViews ?? 0, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Tổng số lượt hiển thị trang' },
    { label: 'Khách truy cập', value: stats?.uniqueVisitors ?? 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Số lượng người dùng duy nhất' },
    { label: 'Lượt click deals', value: stats?.totalClicks ?? 0, icon: MousePointerClick, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Tổng số lần nhấn vào link ưu đãi' },
  ];

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Thống kê tương tác</h1>
          <p className="text-sm text-slate-500 font-medium">Báo cáo chi tiết về lưu lượng truy cập và hành vi người dùng</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm self-start md:self-center">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => fetchStats(d)}
              className={cn("px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
                days === d ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              )}>{d} ngày</button>
          ))}
          <div className="w-[1px] h-6 bg-slate-100 mx-1" />
          <button onClick={() => fetchStats(days)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className={cn("space-y-8", isPending && "opacity-60 transition-opacity")}>
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map(({ label, value, icon: Icon, color, bg, desc }) => (
            <div key={label} className="bg-white rounded-[20px] border border-slate-100 p-12 shadow-sm hover:shadow-md transition-all group relative min-h-[220px] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", bg)}>
                  <Icon className={cn("h-7 w-7", color)} />
                </div>
                <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Live</div>
              </div>
              <div className="mt-auto">
                <p className="text-[36px] font-black text-slate-900 leading-none tracking-tight mb-2">{value.toLocaleString()}</p>
                <p className="text-[14px] font-bold text-slate-800">{label}</p>
                <p className="text-[12px] text-slate-400 font-medium mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Breakdowns */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Thiết bị & Trình duyệt</h3>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Loại thiết bị</p>
                {(stats?.deviceBreakdown || []).map((item: any) => (
                  <div key={item._id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[13px] font-bold">
                      <span className="text-slate-600 capitalize">{item._id}</span>
                      <span className="text-slate-900">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.count / (stats?.totalViews || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Trình duyệt phổ biến</p>
                <div className="grid grid-cols-1 gap-2">
                  {(stats?.browserBreakdown || []).map((item: any) => (
                    <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[13px] font-bold text-slate-700">{item._id}</span>
                      <span className="text-[12px] font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 p-10 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Trang được truy cập nhiều nhất</h3>
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lượt xem</div>
            </div>
            <div className="flex-1 space-y-2">
              {(stats?.topPages || []).map((item: any, i: number) => (
                <div key={item._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-mono text-slate-500 truncate group-hover:text-indigo-600 transition-colors">{item._id}</p>
                  </div>
                  <span className="text-[15px] font-black text-slate-900">{(item.count || 0).toLocaleString()}</span>
                </div>
              ))}
              {!stats?.topPages?.length && (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                  <Layers className="w-12 h-12 mb-4" />
                  <p className="font-bold text-sm">Chưa có dữ liệu trang xem</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Trend Chart */}
        <div className="bg-slate-900 rounded-[24px] p-10 shadow-xl relative overflow-hidden min-h-[400px]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-[18px] font-extrabold text-indigo-400 tracking-tight">Xu hướng lượt xem theo ngày</h3>
                <p className="text-[13px] text-slate-400 font-medium">Báo cáo lượt xem trang trong {days} ngày qua</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
                <Activity className="h-4 w-4 text-indigo-400" />
                <span className="text-[12px] font-bold text-white">Live Data</span>
              </div>
            </div>
            {stats?.dailyTrend?.length ? (
              <div className="flex items-end gap-2 h-48 px-2">
                {stats.dailyTrend.map((day: any) => {
                  const max = Math.max(...stats.dailyTrend.map((d: any) => d.count));
                  const pct = max > 0 ? (day.count / max) * 100 : 0;
                  return (
                    <div key={day._id} className="flex-1 group/bar relative flex flex-col items-center" title={`${day._id}: ${day.count}`}>
                      <div className="w-full bg-indigo-500 hover:bg-white transition-all rounded-t-lg" style={{ height: `${Math.max(pct, 5)}%` }} />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-2 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none shadow-xl">{day.count}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center opacity-40">
                <BarChart3 className="w-12 h-12 text-white mx-auto mb-4" />
                <p className="text-white font-bold">Chưa có dữ liệu xu hướng</p>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
