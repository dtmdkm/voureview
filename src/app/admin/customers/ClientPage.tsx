'use client';

import { useState } from 'react';
import { Trash2, Mail, Users, MailOpen, UserPlus, Search, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ClientPage({ initialLeads, total }: { initialLeads: any[], total: number }) {
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' }),
    });
    // Optimistic UI update
    setLeads(leads.map(l => l.id === id ? { ...l, status: 'read' } : l));
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa lead này?')) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    // Optimistic UI update
    setLeads(leads.filter(l => l.id !== id));
    router.refresh();
  };

  const filteredLeads = leads.filter(lead => 
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total,
    new: leads.filter(l => l.status === 'new').length,
    read: leads.filter(l => l.status === 'read').length,
    replied: leads.filter(l => l.status === 'replied').length,
  };

  const statusColors: Record<string, 'default' | 'success' | 'secondary'> = {
    new: 'default', read: 'success', replied: 'secondary',
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Tổng liên hệ', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Yêu cầu mới', value: stats.new, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Đã xử lý', value: stats.read, icon: MailOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Đã phản hồi', value: stats.replied, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
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
            placeholder="Tìm theo email, tên hoặc tin nhắn..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-100 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="pl-6 pr-3 py-4 text-left text-[12px] font-extrabold text-slate-500 uppercase tracking-wider w-64">Thông tin khách hàng</th>
                  <th className="px-4 py-4 text-left text-[12px] font-extrabold text-slate-500 uppercase tracking-wider">Tin nhắn</th>
                  <th className="px-4 py-4 text-left text-[12px] font-extrabold text-slate-500 uppercase tracking-wider w-32">Nguồn</th>
                  <th className="px-4 py-4 text-left text-[12px] font-extrabold text-slate-500 uppercase tracking-wider w-36">Trạng thái</th>
                  <th className="px-4 py-4 text-left text-[12px] font-extrabold text-slate-500 uppercase tracking-wider w-40">Ngày tạo</th>
                  <th className="px-4 py-4 text-right text-[12px] font-extrabold text-slate-500 uppercase tracking-wider w-24 pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead: any) => (
                  <tr key={lead._id || lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="pl-6 pr-3 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-bold text-slate-900 leading-tight">{lead.email}</span>
                        <span className="text-[12px] font-medium text-slate-400">{lead.name || 'Khách vãng lai'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-md">
                        <p className="text-[13px] text-slate-600 font-medium line-clamp-1 group-hover:line-clamp-none transition-all cursor-default">
                          {lead.message || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {lead.source || 'contact'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusColors[lead.status] || 'default'}>
                        {lead.status === 'new' ? 'Mới' : lead.status === 'read' ? 'Đã đọc' : 'Đã trả lời'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px] font-medium text-slate-400">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        }) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {lead.status === 'new' && (
                          <button onClick={() => handleMarkRead(lead._id || lead.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-all" title="Đánh dấu đã đọc">
                            <Mail className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(lead._id || lead.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-[15px] font-bold text-slate-700">Chưa có khách hàng nào</p>
                      <p className="text-[13px] text-slate-500 mt-1 font-medium">Danh sách liên hệ sẽ hiển thị tại đây khi có khách hàng để lại thông tin.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
