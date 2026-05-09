"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Store, Tag, FolderOpen, FileText, Flame, Settings,
  Globe, LogOut, BookOpen, User, UploadCloud, Download,
  MousePointerClick, BarChart2, PieChart, UserCheck, ScrollText,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavGroup = { label: string | null; items: { href: string; label: string; icon: any; exact?: boolean }[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard, exact: true },
    ]
  },
  {
    label: "ADMIN",
    items: [
      { href: "/admin/blog", label: "Quản lý bài viết", icon: FileText },
      { href: "/admin/legal", label: "Nội dung trang", icon: BookOpen },
      { href: "/admin/settings", label: "Cấu hình Website", icon: Settings },
      { href: "/admin/profile", label: "Hồ sơ cá nhân", icon: User },
    ]
  },
  {
    label: "QUẢN LÝ",
    items: [
      { href: "/admin/categories", label: "Danh mục", icon: FolderOpen },
      { href: "/admin/stores", label: "Cửa hàng", icon: Store },
      { href: "/admin/events", label: "Sự kiện", icon: Flame },
      { href: "/admin/deals", label: "Mã giảm giá", icon: Tag },
      { href: "/admin/upload", label: "Quản lý tệp tải lên", icon: UploadCloud },
      { href: "/admin/customers", label: "Khách hàng", icon: UserCheck },
      { href: "/admin/activity", label: "Nhật ký hoạt động", icon: ScrollText },
    ]
  },
  {
    label: "THỐNG KÊ",
    items: [
      { href: "/admin/analytics", label: "Thống kê tương tác", icon: MousePointerClick },
      { href: "/admin/stats", label: "Thống kê chiến dịch", icon: BarChart2 },
      { href: "/admin/overview", label: "Biểu đồ tổng quan", icon: PieChart },
      { href: "/admin/export", label: "Xuất dữ liệu", icon: Download },
    ]
  },
];

export default function AdminSidebar() {
  console.log("AdminSidebar rendered - Version 3.0 (Voureview Theme)");
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="admin-sidebar shrink-0 flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-40">
      {/* Branding */}
      <div className="px-7 py-8 border-b border-slate-50 flex items-center gap-3">
        <img src="/logo.png" alt="Voureview" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
        <div className="min-w-0">
          <h2 className="font-extrabold text-slate-900 text-[17px] tracking-tight truncate" style={{ fontFamily: "Outfit, sans-serif" }}>
            Voureview CMS
          </h2>
          <p className="text-[11px] font-black text-[#001d5e] uppercase tracking-[0.2em] leading-none mt-1">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation - Scrollable area */}
      <nav className="admin-sidebar-nav">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="admin-sidebar-group">
            {group.label && (
              <h3 className="admin-sidebar-label">
                {group.label}
              </h3>
            )}
            {group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn("admin-sidebar-link group relative", active && "active")}
                >
                  <Icon className="admin-sidebar-icon" />
                  <span>{label}</span>
                  {active && <div className="admin-sidebar-dot" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Area - Profile & System Actions */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/30">
        <div className="mb-4 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#001d5e] flex items-center justify-center text-white text-xs font-bold shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 truncate leading-tight">Administrator</p>
            <p className="text-[11px] text-slate-400 truncate font-medium mt-0.5">admin@voureview.io</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-[#e8edf7] hover:text-[#001d5e] hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
          >
            <Globe className="h-4 w-4" />
            View Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
