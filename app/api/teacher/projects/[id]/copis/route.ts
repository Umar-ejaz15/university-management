import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getStaffId(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { staffId: true } });
  return u?.staffId ?? null;
}

async function ownedProject(projectId: string, staffId: string) {
  return prisma.project.findFirst({ where: { id: projectId, staffId }, select: { id: true } });
}

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const staffId = await getStaffId(user.userId);
  if (!staffId || !await ownedProject(id, staffId)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const coPIs = await prisma.projectCoPI.findMany({ where: { projectId: id }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ coPIs });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const staffId = await getStaffId(user.userId);
  if (!staffId || !await ownedProject(id, staffId)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const coPI = await prisma.projectCoPI.create({
    data: {
      projectId: id,
      name: body.name.trim(),
      designation: body.designation?.trim() || null,
      organization: body.organization?.trim() || null,
      contact: body.contact?.trim() || null,
      email: body.email?.trim() || null,
      type: body.type || 'Internal',
    },
  });
  return NextResponse.json({ coPI }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const staffId = await getStaffId(user.userId);
  if (!staffId || !await ownedProject(id, staffId)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { coPIId } = await req.json();
  await prisma.projectCoPI.deleteMany({ where: { id: coPIId, projectId: id } });
  return NextResponse.json({ ok: true });
}
