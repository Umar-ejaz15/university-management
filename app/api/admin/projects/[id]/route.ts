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
  params: Promise<{ id: string }>;
}

const VALID_STATUS = ['SUBMITTED', 'ONGOING', 'COMPLETED', 'PENDING'] as const;

const PROJECT_INCLUDE = {
  staff: { select: { id: true, name: true, email: true, designation: true, department: { select: { id: true, name: true } } } },
  installments: { orderBy: { installmentNo: 'asc' as const } },
  coPIs: { orderBy: { createdAt: 'asc' as const } },
  teamMembers: { orderBy: { createdAt: 'asc' as const } },
  reports: { orderBy: { createdAt: 'asc' as const } },
};

/**
 * GET /api/admin/projects/[id]
 * Fetch a single project with all related data.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  return NextResponse.json({ project });
}

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
  if (body.objectives !== undefined) data.objectives = body.objectives?.trim() || null;
  if (body.methodology !== undefined) data.methodology = body.methodology?.trim() || null;
  if (body.outcomes !== undefined) data.outcomes = body.outcomes?.trim() || null;
  if (body.deliverables !== undefined) data.deliverables = body.deliverables?.trim() || null;
  if (body.targetBeneficiaries !== undefined) data.targetBeneficiaries = body.targetBeneficiaries?.trim() || null;
  if (body.collaborators !== undefined) data.collaborators = body.collaborators?.trim() || null;
  if (body.thematicArea !== undefined) data.thematicArea = body.thematicArea?.trim() || null;
  if (body.projectCategory !== undefined) data.projectCategory = body.projectCategory?.trim() || null;
  if (body.projectType !== undefined) data.projectType = body.projectType?.trim() || null;
  if (body.funderType !== undefined) data.funderType = body.funderType?.trim() || null;
  if (body.funderLocation !== undefined) data.funderLocation = body.funderLocation?.trim() || null;
  if (body.financialYear !== undefined) data.financialYear = body.financialYear?.trim() || null;
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.sponsoringAgency !== undefined) data.sponsoringAgency = body.sponsoringAgency?.trim() || null;
  if (body.sponsorCountry !== undefined) data.sponsorCountry = body.sponsorCountry?.trim() || null;
  if (body.counterpartName !== undefined) data.counterpartName = body.counterpartName?.trim() || null;
  if (body.projectFileNo !== undefined) data.projectFileNo = body.projectFileNo?.trim() || null;
  if (body.scope !== undefined) data.scope = body.scope || null;

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

  const project = await prisma.project.update({ where: { id }, data, include: PROJECT_INCLUDE });

  return NextResponse.json({ project });
}

/**
 * DELETE /api/admin/projects/[id]
 * ORIC admin permanently deletes a project.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
