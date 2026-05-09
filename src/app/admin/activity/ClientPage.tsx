'use client';

import { useState } from 'react';
import { Search, History, ShieldCheck, Clock, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ACTION_COLORS: Record<string, 'success' | 'default' | 'destructive'> = {
  created: 'success', updated: 'default', deleted: 'destructive',
};
const ENTITY_LABELS: Record<string, string> = {
  store: 'Cửa hàng', deal: 'Mã giảm giá', blog: 'Bài viết',
  category: 'Danh mục', event: 'Sự kiện', setting: 'Cài đặt',
};

export default function ActivityClientPage({ initialLogs }: { initialLogs: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = initialLogs.filter(log =>
    log.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: initialLogs.length,
    created: initialLogs.filter(l => l.action === 'created').length,
    updated: initialLogs.filter(l => l.action === 'updated').length,
    deleted: initialLogs.filter(l => l.action === 'deleted').length,
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Tổng thao tác', value: stats.total, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Thêm mới', value: stats.created, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cập nhật', value: stats.updated, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Đã xóa', value: stats.deleted, icon: History, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
              <s.icon className={cn("h-6 w-6", s.color)} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
              <p className="text-xl font-extrabold text-slate-900 leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Lọc theo tên, đối tượng hoặc chi tiết..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-100 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container min-h-[600px] flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-48">Thời gian</th>
                <th className="w-32">Hành động</th>
                <th className="w-40">Đối tượng</th>
                <th className="min-w-[200px]">Tên / ID</th>
                <th>Chi tiết thao tác</th>
                <th className="text-right w-40">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log: any) => (
                <tr key={log._id || log.id} className="group">
                  <td>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[12px] font-semibold whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={ACTION_COLORS[log.action] || 'default'}>
                      {log.action === 'created' ? 'Tạo mới' : log.action === 'updated' ? 'Cập nhật' : 'Đã xóa'}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-[13px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {ENTITY_LABELS[log.entity] || log.entity}
                    </span>
                  </td>
                  <td>
                    <span className="text-[13.5px] font-bold text-slate-900 truncate block max-w-xs">
                      {log.entityName || '—'}
                    </span>
                  </td>
                  <td>
                    <p className="text-[13px] text-slate-500 font-medium line-clamp-1 group-hover:line-clamp-none transition-all cursor-default">
                      {log.details || 'Không có chi tiết'}
                    </p>
                  </td>
                  <td className="text-right">
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {log.ip || '0.0.0.0'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <History className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-[15px] font-bold text-slate-700">Chưa có bản ghi hoạt động nào</p>
                    <p className="text-[13px] text-slate-500 mt-1 font-medium">Lịch sử thao tác sẽ xuất hiện khi có thay đổi trên hệ thống.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
