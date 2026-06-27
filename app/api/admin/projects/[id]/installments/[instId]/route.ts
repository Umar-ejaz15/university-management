import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ORIC') return null;
  return payload;
}

interface RouteParams {
  params: Promise<{ id: string; instId: string }>;
}

/**
 * PATCH /api/admin/projects/[id]/installments/[instId]
 * Update an installment — typically to mark it RELEASED (sets releaseDate),
 * adjust amount, due date, or note.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, instId } = await params;
  const body = await req.json();

  const existing = await prisma.installment.findUnique({ where: { id: instId } });
  if (!existing || existing.projectId !== id) {
    return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }
    data.amount = amount;
  }
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.note !== undefined) data.note = body.note?.trim() || null;

  if (body.status !== undefined) {
    if (!['PENDING', 'RELEASED'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = body.status;
    // Stamp/clear the release date to match the new status unless one is given.
    if (body.releaseDate !== undefined) {
      data.releaseDate = body.releaseDate ? new Date(body.releaseDate) : null;
    } else if (body.status === 'RELEASED' && !existing.releaseDate) {
      data.releaseDate = new Date();
    } else if (body.status === 'PENDING') {
      data.releaseDate = null;
    }
  } else if (body.releaseDate !== undefined) {
    data.releaseDate = body.releaseDate ? new Date(body.releaseDate) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const installment = await prisma.installment.update({ where: { id: instId }, data });
  return NextResponse.json({ installment });
}

/** DELETE /api/admin/projects/[id]/installments/[instId] — remove a tranche. */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, instId } = await params;
  const existing = await prisma.installment.findUnique({ where: { id: instId } });
  if (!existing || existing.projectId !== id) {
    return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
  }

  await prisma.installment.delete({ where: { id: instId } });
  return NextResponse.json({ message: 'Installment deleted' });
}
