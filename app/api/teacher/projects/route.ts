import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    console.error('Get projects error:', error);
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

    const body = await request.json();
    const { title, description, startDate, endDate, studentCount } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Teacher chooses the project classification; budget/funding is admin-only.
    const projectKind = body.projectKind === 'INDUSTRY' ? 'INDUSTRY' : 'RESEARCH';
    const scope = body.scope === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'NATIONAL';

    const [staff, project] = await Promise.all([
      prisma.staff.findUnique({ where: { id: dbUser.staffId }, select: { name: true } }),
      prisma.project.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          objectives: body.objectives?.trim() || null,
          methodology: body.methodology?.trim() || null,
          outcomes: body.outcomes?.trim() || null,
          collaborators: body.collaborators?.trim() || null,
          projectUrl: body.projectUrl?.trim() || null,
          projectKind,
          scope,
          // ORIC classification fields
          thematicArea: body.thematicArea?.trim() || null,
          projectCategory: body.projectCategory || null,
          projectType: body.projectType || null,
          funderType: body.funderType || null,
          funderLocation: body.funderLocation || null,
          funderCountry: body.funderCountry?.trim() || null,
          fundingCallTitle: body.fundingCallTitle?.trim() || null,
          dateOfCirculation: body.dateOfCirculation ? new Date(body.dateOfCirculation) : null,
          submissionDeadline: body.submissionDeadline ? new Date(body.submissionDeadline) : null,
          // Industry fields
          projectFileNo: body.projectFileNo?.trim() || null,
          financialYear: body.financialYear?.trim() || null,
          awardDate: body.awardDate ? new Date(body.awardDate) : null,
          sponsoringAgency: body.sponsoringAgency?.trim() || null,
          sponsorCountry: body.sponsorCountry?.trim() || null,
          sponsorAddress: body.sponsorAddress?.trim() || null,
          counterpartName: body.counterpartName?.trim() || null,
          counterpartCountry: body.counterpartCountry?.trim() || null,
          counterpartAddress: body.counterpartAddress?.trim() || null,
          // Work plan / deliverables
          targetBeneficiaries: body.targetBeneficiaries?.trim() || null,
          deliverables: body.deliverables?.trim() || null,
          monitoringPlan: body.monitoringPlan?.trim() || null,
          remarks: body.remarks?.trim() || null,
          // Budget declared by faculty (ORIC will confirm)
          budgetAmount: body.budgetAmount ? body.budgetAmount : null,
          // Core fields
          status: 'SUBMITTED',
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          studentCount: typeof studentCount === 'number' ? studentCount : 0,
          imageUrl: body.imageUrl?.trim() || null,
          staffId: dbUser.staffId,
          verificationStatus: 'PENDING',
          rejectionReason: null,
        },
      }),
    ]);

    // Create Co-PIs
    if (Array.isArray(body.coPIs) && body.coPIs.length > 0) {
      await prisma.projectCoPI.createMany({
        data: body.coPIs
          .filter((c: { name?: string }) => c.name?.trim())
          .map((c: { name: string; designation?: string; organization?: string; contact?: string; email?: string; type?: string }) => ({
            projectId: project.id,
            name: c.name.trim(),
            designation: c.designation?.trim() || null,
            organization: c.organization?.trim() || null,
            contact: c.contact?.trim() || null,
            email: c.email?.trim() || null,
            type: c.type || 'Internal',
          })),
      });
    }

    // Create team members
    if (Array.isArray(body.teamMembers) && body.teamMembers.length > 0) {
      await prisma.projectTeamMember.createMany({
        data: body.teamMembers
          .filter((m: { name?: string }) => m.name?.trim())
          .map((m: { name: string; designation?: string; department?: string; role?: string }) => ({
            projectId: project.id,
            name: m.name.trim(),
            designation: m.designation?.trim() || null,
            department: m.department?.trim() || null,
            role: m.role?.trim() || null,
          })),
      });
    }

    // Notify ORIC admin of the new submission
    await prisma.notification.create({
      data: {
        type: 'PROJECT_SUBMITTED',
        title: 'New Project Submission',
        message: `${staff?.name ?? 'A teacher'} submitted "${title.trim()}" (${projectKind} · ${scope}) for ORIC approval`,
        link: '/admin/oric',
        metadata: {
          projectId: project.id,
          staffId: dbUser.staffId,
          projectKind,
          scope,
        },
      },
    }).catch(() => { /* non-critical — don't fail the request */ });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
