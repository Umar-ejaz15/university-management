import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !['ADMIN','ORIC'].includes(payload.role)) return null;
  return payload;
}

interface Params { params: Promise<{ id: string; reportId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { reportId } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.reportType !== undefined) data.reportType = body.reportType;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.submissionDate !== undefined) data.submissionDate = body.submissionDate ? new Date(body.submissionDate) : null;
  if (body.status !== undefined) data.status = body.status;
  if (body.fileUrl !== undefined) data.fileUrl = body.fileUrl || null;
  const report = await prisma.projectReport.update({ where: { id: reportId }, data });
  return NextResponse.json({ report });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { reportId } = await params;
  await prisma.projectReport.delete({ where: { id: reportId } });
  return NextResponse.json({ ok: true });
}
