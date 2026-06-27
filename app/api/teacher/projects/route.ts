import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import { parseBody, isParsed } from '@/lib/api';
import { CreateProjectSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    if (!dbUser?.staffId) {
      return NextResponse.json({ error: 'No staff profile' }, { status: 404 });
    }

    const projects = await prisma.project.findMany({
      where: { staffId: dbUser.staffId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    logError('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    if (!dbUser?.staffId) {
      return NextResponse.json({ error: 'No staff profile' }, { status: 404 });
    }

    const body = await parseBody(request, CreateProjectSchema);
    if (!isParsed(body)) return body;
    const data = body;

    const [staff, project] = await Promise.all([
      prisma.staff.findUnique({ where: { id: dbUser.staffId }, select: { name: true } }),
      prisma.project.create({
        data: {
          title: data.title,
          description: data.description ?? null,
          objectives: data.objectives ?? null,
          methodology: data.methodology ?? null,
          outcomes: data.outcomes ?? null,
          collaborators: data.collaborators ?? null,
          projectUrl: data.projectUrl ?? null,
          projectKind: data.projectKind,
          scope: data.scope,
          // ORIC classification fields
          thematicArea: data.thematicArea ?? null,
          projectCategory: data.projectCategory ?? null,
          projectType: data.projectType ?? null,
          funderType: data.funderType ?? null,
          funderLocation: data.funderLocation ?? null,
          funderCountry: data.funderCountry ?? null,
          fundingCallTitle: data.fundingCallTitle ?? null,
          dateOfCirculation: data.dateOfCirculation ? new Date(data.dateOfCirculation) : null,
          submissionDeadline: data.submissionDeadline ? new Date(data.submissionDeadline) : null,
          // Industry fields
          projectFileNo: data.projectFileNo ?? null,
          financialYear: data.financialYear ?? null,
          awardDate: data.awardDate ? new Date(data.awardDate) : null,
          sponsoringAgency: data.sponsoringAgency ?? null,
          sponsorCountry: data.sponsorCountry ?? null,
          sponsorAddress: data.sponsorAddress ?? null,
          counterpartName: data.counterpartName ?? null,
          counterpartCountry: data.counterpartCountry ?? null,
          counterpartAddress: data.counterpartAddress ?? null,
          // Work plan / deliverables
          targetBeneficiaries: data.targetBeneficiaries ?? null,
          deliverables: data.deliverables ?? null,
          monitoringPlan: data.monitoringPlan ?? null,
          remarks: data.remarks ?? null,
          // Budget declared by faculty (ORIC will confirm)
          budgetAmount: data.budgetAmount ?? null,
          // Core fields
          status: 'SUBMITTED',
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          studentCount: data.studentCount,
          imageUrl: data.imageUrl ?? null,
          staffId: dbUser.staffId,
          verificationStatus: 'PENDING',
          rejectionReason: null,
        },
      }),
    ]);

    // Create Co-PIs
    if (data.coPIs && data.coPIs.length > 0) {
      await prisma.projectCoPI.createMany({
        data: data.coPIs.map((c) => ({
          projectId: project.id,
          name: c.name,
          designation: c.designation ?? null,
          organization: c.organization ?? null,
          contact: c.contact ?? null,
          email: c.email ?? null,
          type: c.type || 'Internal',
        })),
      });
    }

    // Create team members
    if (data.teamMembers && data.teamMembers.length > 0) {
      await prisma.projectTeamMember.createMany({
        data: data.teamMembers.map((m) => ({
          projectId: project.id,
          name: m.name,
          designation: m.designation ?? null,
          department: m.department ?? null,
          role: m.role ?? null,
        })),
      });
    }

    // Notify ORIC admin of the new submission
    await prisma.notification.create({
      data: {
        type: 'PROJECT_SUBMITTED',
        title: 'New Project Submission',
        message: `${staff?.name ?? 'A teacher'} submitted "${data.title}" (${data.projectKind} · ${data.scope}) for ORIC approval`,
        link: '/oric-admin/projects',
        metadata: {
          projectId: project.id,
          staffId: dbUser.staffId,
          projectKind: data.projectKind,
          scope: data.scope,
        },
      },
    }).catch(() => { /* non-critical — don't fail the request */ });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    logError('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
