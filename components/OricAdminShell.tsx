'use client';

import OricAdminSidebar from '@/components/OricAdminSidebar';
import OricAdminTopBar from '@/components/OricAdminTopBar';

export default function OricAdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <OricAdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <OricAdminTopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
