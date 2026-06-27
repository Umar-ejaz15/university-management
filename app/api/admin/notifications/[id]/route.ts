import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.notification.update({ where: { id }, data: { isRead: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Notification PATCH error:', error);
    return NextResponse.json({ error: 'Failed to mark notification' }, { status: 500 });
  }
}
