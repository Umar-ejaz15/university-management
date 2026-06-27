import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authResult = await requireAdmin(user);
  if (!authResult.authorized) return NextResponse.json({ error: authResult.reason }, { status: 403 });
  const { id } = await params;
  const milestones = await prisma.projectMilestone.findMany({
    where: { projectId: id },
    orderBy: { targetDate: 'asc' },
  });
  return NextResponse.json({ milestones });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authResult = await requireAdmin(user);
  if (!authResult.authorized) return NextResponse.json({ error: authResult.reason }, { status: 403 });
  const { id } = await params;
  const { title, description, targetDate } = await req.json();
  if (!title?.trim() || !targetDate) {
    return NextResponse.json({ error: 'Title and target date are required' }, { status: 400 });
  }
  const milestone = await prisma.projectMilestone.create({
    data: { projectId: id, title: title.trim(), description: description?.trim() || null, targetDate: new Date(targetDate) },
  });
  return NextResponse.json({ milestone }, { status: 201 });
}
