import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import { parseBody, isParsed } from '@/lib/api';
import { UpdateStaffSchema } from '@/lib/schemas';

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/staff/[id]
 * Update a staff member's core profile fields.
 */
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const auth = await requireAdmin(user, request.url);
    if (!auth.authorized) return NextResponse.json({ error: auth.reason }, { status: 403 });

    const body = await parseBody(request, UpdateStaffSchema);
    if (!isParsed(body)) return body;
    const { name, email, designation, departmentId, specialization, experienceYears, bio, qualifications } = body;

    if (!name || !email || !designation || !departmentId) {
      return NextResponse.json(
        { error: 'Name, email, designation, and department are required' },
        { status: 400 }
      );
    }

    const member = await prisma.staff.update({
      where: { id },
      data: {
        name,
        email,
        designation,
        departmentId,
        specialization: specialization || null,
        experienceYears: experienceYears || null,
        bio: bio || null,
        qualifications: qualifications || null,
      },
    });

    return NextResponse.json({ message: 'Staff member updated', staff: member });
  } catch (err: unknown) {
    logError('PUT /api/admin/staff/[id] error:', err);
    if (err && typeof err === 'object' && 'code' in err) {
      if ((err as { code: string }).code === 'P2025')
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      if ((err as { code: string }).code === 'P2002')
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/staff/[id]
 *
 * Query param: ?cascade=true
 *   When present, explicitly deletes all related ORIC data before deleting the
 *   staff record. Even without it Prisma cascades via onDelete: Cascade on the
 *   relation, but some junction tables (ipDisclosures, ipLicensings, mous, etc.)
 *   may not cascade — we delete them explicitly when cascade=true to be safe.
 */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const auth = await requireAdmin(user, request.url);
    if (!auth.authorized) return NextResponse.json({ error: auth.reason }, { status: 403 });

    const cascade = new URL(request.url).searchParams.get('cascade') === 'true';

    const existing = await prisma.staff.findUnique({
      where: { id },
      select: { name: true },
    });
    if (!existing) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

    if (cascade) {
      // Explicitly delete all related data in a transaction
      await prisma.$transaction([
        prisma.publication.deleteMany({ where: { staffId: id } }),
        prisma.project.deleteMany({ where: { staffId: id } }),
        prisma.course.deleteMany({ where: { staffId: id } }),
        prisma.consultancy.deleteMany({ where: { staffId: id } }),
        prisma.patent.deleteMany({ where: { staffId: id } }),
        prisma.iPDisclosure.deleteMany({ where: { staffId: id } }),
        prisma.iPLicensing.deleteMany({ where: { staffId: id } }),
        prisma.mou.deleteMany({ where: { staffId: id } }),
        prisma.industrialVisit.deleteMany({ where: { staffId: id } }),
        prisma.event.deleteMany({ where: { staffId: id } }),
        prisma.policyAdvocacy.deleteMany({ where: { staffId: id } }),
        prisma.equipmentRequest.deleteMany({ where: { staffId: id } }),
        prisma.staff.delete({ where: { id } }),
      ]);
    } else {
      await prisma.staff.delete({ where: { id } });
    }

    return NextResponse.json({ message: 'Staff member deleted' });
  } catch (err: unknown) {
    logError('DELETE /api/admin/staff/[id] error:', err);
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}
