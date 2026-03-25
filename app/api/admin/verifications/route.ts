import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

/**
 * GET /api/admin/verifications
 * Returns all items pending verification grouped by teacher,
 * plus counts per type.
 */
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [pendingProfiles, pendingProjects] =
    await Promise.all([
      prisma.staff.findMany({
        where: { profileVerificationStatus: 'PENDING', status: 'APPROVED' },
        select: {
          id: true, name: true, email: true, designation: true,
          profileVerificationStatus: true, profileRejectionReason: true,
          bio: true, specialization: true, qualifications: true,
          experienceYears: true, profileImage: true, updatedAt: true,
          department: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.project.findMany({
        where: { verificationStatus: 'PENDING' },
        include: {
          staff: { select: { id: true, name: true, email: true, department: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

  const totalPending = pendingProfiles.length + pendingProjects.length;

  return NextResponse.json({
    totalPending,
    counts: {
      profiles: pendingProfiles.length,
      projects: pendingProjects.length,
    },
    pendingProfiles,
    pendingProjects,
  });
}
