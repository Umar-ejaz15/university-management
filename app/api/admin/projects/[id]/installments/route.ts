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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/admin/projects/[id]/installments — list a project's installments. */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const installments = await prisma.installment.findMany({
    where: { projectId: id },
    orderBy: { installmentNo: 'asc' },
  });
  return NextResponse.json({ installments });
}

/**
 * POST /api/admin/projects/[id]/installments — add an installment tranche.
 * Body: { amount, dueDate?, releaseDate?, status?, note?, installmentNo? }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const amount = Number(body.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  // Auto-number the installment if not supplied.
  let installmentNo = Number(body.installmentNo);
  if (Number.isNaN(installmentNo) || installmentNo <= 0) {
    const last = await prisma.installment.findFirst({
      where: { projectId: id },
      orderBy: { installmentNo: 'desc' },
      select: { installmentNo: true },
    });
    installmentNo = (last?.installmentNo ?? 0) + 1;
  }

  const status = body.status === 'RELEASED' ? 'RELEASED' : 'PENDING';

  try {
    const installment = await prisma.installment.create({
      data: {
        projectId: id,
        installmentNo,
        amount,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : (status === 'RELEASED' ? new Date() : null),
        status,
        note: body.note?.trim() || null,
      },
    });
    return NextResponse.json({ installment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: `Installment #${installmentNo} already exists for this project` },
      { status: 409 }
    );
  }
}
