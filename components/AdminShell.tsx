'use client';

import AdminSidebar from '@/components/AdminSidebar';
import AdminTopBar from '@/components/AdminTopBar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <AdminTopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
