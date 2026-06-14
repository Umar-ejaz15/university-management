import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import OricAdminSidebar from '@/components/OricAdminSidebar';
import OricAdminTopBar from '@/components/OricAdminTopBar';

export default async function OricAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORIC' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

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
