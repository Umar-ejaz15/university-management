import { NextResponse } from 'next/server';
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

/**
 * POST /api/admin/projects
 * ORIC admin creates a new project directly (on behalf of a faculty member).
 */
export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!body.staffId) return NextResponse.json({ error: 'Faculty member is required' }, { status: 400 });

  const staff = await prisma.staff.findUnique({ where: { id: body.staffId } });
  if (!staff) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

  const project = await prisma.project.create({
    data: {
      title: body.title.trim(),
      description: body.description || null,
      objectives: body.objectives || null,
      methodology: body.methodology || null,
      outcomes: body.outcomes || null,
      projectKind: body.projectKind || 'RESEARCH',
      scope: body.scope || 'NATIONAL',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      budgetAmount: body.budgetAmount ? String(body.budgetAmount) : null,
      currency: body.currency || 'PKR',
      fundingAgency: body.fundingAgency || null,
      thematicArea: body.thematicArea || null,
      projectCategory: body.projectCategory || null,
      projectType: body.projectType || null,
      funderType: body.funderType || null,
      funderLocation: body.funderLocation || null,
      funderCountry: body.funderCountry || null,
      fundingCallTitle: body.fundingCallTitle || null,
      dateOfCirculation: body.dateOfCirculation ? new Date(body.dateOfCirculation) : null,
      submissionDeadline: body.submissionDeadline ? new Date(body.submissionDeadline) : null,
      sponsoringAgency: body.sponsoringAgency || null,
      sponsorCountry: body.sponsorCountry || null,
      sponsorAddress: body.sponsorAddress || null,
      counterpartName: body.counterpartName || null,
      counterpartCountry: body.counterpartCountry || null,
      counterpartAddress: body.counterpartAddress || null,
      projectFileNo: body.projectFileNo || null,
      financialYear: body.financialYear || null,
      awardLetterDate: body.awardLetterDate ? new Date(body.awardLetterDate) : null,
      deliverables: body.deliverables || null,
      targetBeneficiaries: body.targetBeneficiaries || null,
      monitoringPlan: body.monitoringPlan || null,
      remarks: body.remarks || null,
      // ORIC-created projects are auto-verified (ORIC is the approval authority)
      verificationStatus: 'VERIFIED',
      status: 'ONGOING',
      staffId: body.staffId,
    },
    include: {
      staff: {
        select: { id: true, name: true, email: true, designation: true, department: { select: { id: true, name: true } } },
      },
      installments: true,
      coPIs: true,
      teamMembers: true,
      reports: true,
    },
  });

  // Create Co-PIs
  if (Array.isArray(body.coPIs) && body.coPIs.length > 0) {
    await prisma.projectCoPI.createMany({
      data: body.coPIs.map((c: { name: string; designation?: string; organization?: string; contact?: string; email?: string; type?: string }) => ({
        projectId: project.id,
        name: c.name,
        designation: c.designation || null,
        organization: c.organization || null,
        contact: c.contact || null,
        email: c.email || null,
        type: c.type || 'Internal',
      })),
    });
  }

  // Create team members
  if (Array.isArray(body.teamMembers) && body.teamMembers.length > 0) {
    await prisma.projectTeamMember.createMany({
      data: body.teamMembers.map((m: { name: string; designation?: string; department?: string; role?: string }) => ({
        projectId: project.id,
        name: m.name,
        designation: m.designation || null,
        department: m.department || null,
        role: m.role || null,
      })),
    });
  }

  return NextResponse.json({ project }, { status: 201 });
}

/**
 * GET /api/admin/projects
 * Full ORIC project register for the admin — every project regardless of
 * status/verification, including budget + installment schedule.
 */
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          email: true,
          designation: true,
          department: { select: { id: true, name: true } },
        },
      },
      installments: { orderBy: { installmentNo: 'asc' } },
      coPIs: { orderBy: { createdAt: 'asc' } },
      teamMembers: { orderBy: { createdAt: 'asc' } },
      reports: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: [{ updatedAt: 'desc' }],
  });

  return NextResponse.json({ projects });
}
