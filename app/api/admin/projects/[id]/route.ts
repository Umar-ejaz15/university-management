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

const VALID_STATUS = ['SUBMITTED', 'ONGOING', 'COMPLETED', 'PENDING'] as const;

/**
 * PATCH /api/admin/projects/[id]
 * ORIC-only management of a project: total budget, currency, funding agency,
 * and lifecycle status (e.g. mark ONGOING / COMPLETED). These fields are NOT
 * editable by the submitting teacher.
 *
 * Body (all optional): { budgetAmount, currency, fundingAgency, fundingAmount, status }
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const t = body.title?.trim();
    if (!t) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    data.title = t;
  }
  if (body.description !== undefined) data.description = body.description?.trim() || null;

  if (body.budgetAmount !== undefined) {
    if (body.budgetAmount === null || body.budgetAmount === '') {
      data.budgetAmount = null;
    } else {
      const n = Number(body.budgetAmount);
      if (Number.isNaN(n) || n < 0) {
        return NextResponse.json({ error: 'budgetAmount must be a positive number' }, { status: 400 });
      }
      data.budgetAmount = n;
    }
  }
  if (body.currency !== undefined) data.currency = body.currency?.trim() || 'PKR';
  if (body.fundingAgency !== undefined) data.fundingAgency = body.fundingAgency?.trim() || null;
  if (body.fundingAmount !== undefined) data.fundingAmount = body.fundingAmount?.trim() || null;

  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = body.status;
  }

  // ORIC post-award fields
  if (body.oricOverheadAmount !== undefined) {
    data.oricOverheadAmount = body.oricOverheadAmount === null || body.oricOverheadAmount === '' ? null : Number(body.oricOverheadAmount);
  }
  if (body.overheadStatus !== undefined) data.overheadStatus = body.overheadStatus || null;
  if (body.awardLetterDate !== undefined) data.awardLetterDate = body.awardLetterDate ? new Date(body.awardLetterDate) : null;
  if (body.fundingAgencyRefNo !== undefined) data.fundingAgencyRefNo = body.fundingAgencyRefNo?.trim() || null;
  if (body.specialConditions !== undefined) data.specialConditions = body.specialConditions?.trim() || null;
  if (body.reportsStatus !== undefined) data.reportsStatus = body.reportsStatus || null;
  if (body.fileStatus !== undefined) data.fileStatus = body.fileStatus || null;
  if (body.remarks !== undefined) data.remarks = body.remarks?.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id },
    data,
    include: {
      installments: { orderBy: { installmentNo: 'asc' } },
      coPIs: { orderBy: { createdAt: 'asc' } },
      teamMembers: { orderBy: { createdAt: 'asc' } },
      reports: { orderBy: { createdAt: 'asc' } },
    },
  });

  return NextResponse.json({ project });
}
