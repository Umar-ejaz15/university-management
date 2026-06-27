import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import OricAdminShell from '@/components/OricAdminShell';

export default async function OricAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ORIC') {
    redirect(user?.role === 'ADMIN' ? '/admin' : '/login');
  }

  return <OricAdminShell>{children}</OricAdminShell>;
}
