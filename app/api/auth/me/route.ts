import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch additional user data including staffId
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    // If user has staffId, fetch staff status and rejection reason
    let staffData = null;
    if (dbUser?.staffId) {
      const staff = await prisma.staff.findUnique({
        where: { id: dbUser.staffId },
        select: {
          status: true,
          createdAt: true,
        },
      });

      if (staff) {
        // Get rejection reason from audit log if rejected
        let rejectionReason = null;
        if (staff.status === 'REJECTED') {
          const rejectionLog = await prisma.auditLog.findFirst({
            where: {
              targetType: 'STAFF',
              targetId: dbUser.staffId,
              action: 'REJECT_FACULTY',
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              metadata: true,
            },
          });

          rejectionReason =
            rejectionLog?.metadata &&
            typeof rejectionLog.metadata === 'object' &&
            'rejectionReason' in rejectionLog.metadata
              ? (rejectionLog.metadata as { rejectionReason: string }).rejectionReason
              : null;
        }

        staffData = {
          status: staff.status,
          createdAt: staff.createdAt,
          rejectionReason,
        };
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        staffId: dbUser?.staffId,
      },
      staff: staffData,
    }, { status: 200 });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
