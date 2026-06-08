import AdminSidebar from '@/components/AdminSidebar';
import AdminTopBar  from '@/components/AdminTopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <AdminSidebar />

      {/* Content column */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Notification bell + user — top-right of content area */}
        <AdminTopBar />

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
