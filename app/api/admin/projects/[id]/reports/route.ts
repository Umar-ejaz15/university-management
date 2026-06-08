import { NextRequest, NextResponse } from 'next/server';
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

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const reports = await prisma.projectReport.findMany({ where: { projectId: id }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const report = await prisma.projectReport.create({
    data: {
      projectId: id,
      reportType: body.reportType || 'Progress',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      submissionDate: body.submissionDate ? new Date(body.submissionDate) : null,
      status: body.status || 'Due',
      fileUrl: body.fileUrl || null,
    },
  });
  return NextResponse.json({ report }, { status: 201 });
}
