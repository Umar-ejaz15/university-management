import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Faculty Landing Page
 *
 * Redirects authenticated users to their own profile.
 * If no staff profile exists, redirects to onboarding.
 */
export default async function FacultyPage() {
  const user = await getCurrentUser();

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    if (dbUser?.staffId) {
      redirect(`/faculty/${dbUser.staffId}`);
    } else {
      redirect('/onboarding/teacher');
    }
  }

  // Fallback for non-authenticated users
  redirect('/login');
}
