'use client';

import { useState } from 'react';
import { Save, Loader2, KeyRound, User, ShieldCheck, Mail, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function AdminProfile() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Đổi mật khẩu thành công!');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMsg(data.error || 'Đổi mật khẩu thất bại!');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto" style={{ padding: '0 32px 32px 32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Hồ sơ cá nhân</h1>
          <p className="text-sm text-slate-500 font-medium">Quản lý tài khoản quản trị và bảo mật của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex flex-col items-center text-center" style={{ padding: '32px' }}>
              <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 mb-6 border-4 border-white">
                AD
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Administrator</h3>
              <p className="text-[13px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Super Admin</p>
              
              <div className="w-full mt-8 space-y-4">
                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                       <p className="text-[13px] font-bold text-slate-700 truncate">admin@bobocms.io</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ngày tham gia</p>
                       <p className="text-[13px] font-bold text-slate-700">01/01/2024</p>
                    </div>
                 </div>
              </div>

              <button className="w-full mt-6 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2">
                 <LogOut className="h-4 w-4" />
                 Đăng xuất hệ thống
              </button>
           </div>

           <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden" style={{ padding: '32px' }}>
              <div className="relative z-10">
                 <ShieldCheck className="h-10 w-10 text-white/50 mb-4" />
                 <h4 className="text-[18px] font-extrabold tracking-tight mb-2">Bảo mật tài khoản</h4>
                 <p className="text-indigo-100 text-[13px] font-medium leading-relaxed">Luôn đảm bảo mật khẩu của bạn có độ phức tạp cao và không chia sẻ cho bất kỳ ai.</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
           </div>
        </div>

        {/* Security Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 lg:p-10 shadow-sm min-h-[500px]" style={{ padding: '32px' }}>
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-amber-600" />
               </div>
               <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Thay đổi mật khẩu</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-slate-700 ml-1">Mật khẩu hiện tại</Label>
                <Input 
                  type="password" 
                  value={form.currentPassword} 
                  onChange={e => set('currentPassword', e.target.value)} 
                  required 
                  className="h-11 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="w-full h-[1px] bg-slate-100 my-4" />

              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-slate-700 ml-1">Mật khẩu mới</Label>
                <Input 
                  type="password" 
                  value={form.newPassword} 
                  onChange={e => set('newPassword', e.target.value)} 
                  required 
                  minLength={6} 
                  className="h-11 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Mật khẩu tối thiểu 6 ký tự"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-slate-700 ml-1">Xác nhận mật khẩu mới</Label>
                <Input 
                  type="password" 
                  value={form.confirmPassword} 
                  onChange={e => set('confirmPassword', e.target.value)} 
                  required 
                  className="h-11 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {msg && (
                <div className={cn(
                  "p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300",
                  msg.includes('thành công') 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-red-50 text-red-600 border border-red-100'
                )}>
                  {msg}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={saving}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-100 transition-all active:scale-95"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Cập nhật bảo mật
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
