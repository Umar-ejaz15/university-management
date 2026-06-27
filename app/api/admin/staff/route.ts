import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireAdmin, requireRole } from '@/lib/authorization';
import { prisma } from '@/lib/db';
import { parseBody, isParsed } from '@/lib/api';
import { CreateStaffSchema } from '@/lib/schemas';
import { logError } from '@/lib/logger';

const STAFF_INCLUDE = {
  department: {
    select: {
      id: true,
      name: true,
      faculty: { select: { id: true, name: true, shortName: true } },
    },
  },
  _count: {
    select: {
      publications: true,
      projects: true,
      courses: true,
      consultancies: true,
      patents: true,
      mous: true,
      events: true,
      industrialVisits: true,
      policyAdvocacies: true,
      ipDisclosures: true,
      ipLicensings: true,
      equipmentRequests: true,
    },
  },
} as const;

/**
 * GET /api/admin/staff
 * Returns all staff members with department, faculty, and counts.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const auth = await requireRole(user, ['ADMIN', 'ORIC']);
    if (!auth.authorized) return NextResponse.json({ error: auth.reason }, { status: 403 });

    const staff = await prisma.staff.findMany({
      include: STAFF_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ staff });
  } catch (err) {
    logError('GET /api/admin/staff error:', err);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

/**
 * POST /api/admin/staff
 * Create a new staff member.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const auth = await requireAdmin(user, request.url);
    if (!auth.authorized) return NextResponse.json({ error: auth.reason }, { status: 403 });

    const body = await parseBody(request, CreateStaffSchema);
    if (!isParsed(body)) return body;
    const { name, email, designation, departmentId, specialization, experienceYears, bio, qualifications } = body;

    const member = await prisma.staff.create({
      data: {
        name,
        email,
        designation,
        departmentId,
        specialization: specialization || null,
        experienceYears: experienceYears || null,
        bio: bio || null,
        qualifications: qualifications || null,
        status: 'APPROVED',
        profileVerificationStatus: 'VERIFIED',
      },
      include: STAFF_INCLUDE,
    });

    return NextResponse.json({ message: 'Staff member created', staff: member }, { status: 201 });
  } catch (err: unknown) {
    logError('POST /api/admin/staff error:', err);
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      return NextResponse.json({ error: 'A staff member with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}
