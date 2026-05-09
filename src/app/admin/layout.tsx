import './admin.css';
import AdminSidebar from "@/components/AdminSidebar";
import ProgressBar from "@/components/ProgressBar";
import { Suspense } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-screen bg-slate-50 flex">
      <Suspense fallback={null}>
        <ProgressBar />
      </Suspense>
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto admin-main-scroll">
          <div className="admin-main mx-auto" style={{ maxWidth: '1600px' }}>
            <div className="admin-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
