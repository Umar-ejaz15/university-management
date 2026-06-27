import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireRole } from '@/lib/authorization';
import { prisma } from '@/lib/db';

type RouteParams = { params: Promise<{ id: string; mid: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authResult = await requireRole(user, ['ADMIN', 'ORIC']);
  if (!authResult.authorized) return NextResponse.json({ error: authResult.reason }, { status: 403 });
  const { mid } = await params;
  const { status, completedDate, title, description, targetDate } = await req.json();

  const milestone = await prisma.projectMilestone.update({
    where: { id: mid },
    data: {
      ...(status !== undefined && { status }),
      ...(completedDate !== undefined && { completedDate: completedDate ? new Date(completedDate) : null }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(targetDate !== undefined && { targetDate: new Date(targetDate) }),
    },
  });
  return NextResponse.json({ milestone });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authResult = await requireRole(user, ['ADMIN', 'ORIC']);
  if (!authResult.authorized) return NextResponse.json({ error: authResult.reason }, { status: 403 });
  const { mid } = await params;
  await prisma.projectMilestone.delete({ where: { id: mid } });
  return NextResponse.json({ ok: true });
}
