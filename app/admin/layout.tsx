import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import AdminShell from '@/components/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect(user?.role === 'ORIC' ? '/oric-admin' : '/login');
  }

  return <AdminShell>{children}</AdminShell>;
}
