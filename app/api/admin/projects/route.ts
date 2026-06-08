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
 * GET /api/admin/projects
 * Full ORIC project register for the admin — every project regardless of
 * status/verification, including budget + installment schedule.
 */
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
          department: { select: { id: true, name: true } },
        },
      },
      installments: { orderBy: { installmentNo: 'asc' } },
      coPIs: { orderBy: { createdAt: 'asc' } },
      teamMembers: { orderBy: { createdAt: 'asc' } },
      reports: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: [{ updatedAt: 'desc' }],
  });

  return NextResponse.json({ projects });
}
