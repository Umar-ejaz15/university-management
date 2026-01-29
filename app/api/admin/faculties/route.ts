import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/faculties
 * Get all faculties with department counts
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const faculties = await prisma.faculty.findMany({
      include: {
        _count: {
          select: { departments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ faculties });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json({ error: 'Failed to fetch faculties' }, { status: 500 });
  }
}

/**
 * POST /api/admin/faculties
 * Create a new faculty
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const body = await request.json();
    const { name, shortName, dean, establishedYear, description } = body;

    if (!name || !shortName || !dean || !establishedYear) {
      return NextResponse.json(
        { error: 'Name, shortName, dean, and establishedYear are required' },
        { status: 400 }
      );
    }

    const faculty = await prisma.faculty.create({
      data: {
        name,
        shortName,
        dean,
        establishedYear: parseInt(establishedYear),
        description: description || null,
      },
    });

    await createAuditLog({
      action: 'CREATE_FACULTY',
      performedBy: user.userId,
      targetType: 'FACULTY',
      targetId: faculty.id,
      metadata: { facultyName: name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Faculty created successfully', faculty }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating faculty:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A faculty with this name or short name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to create faculty' }, { status: 500 });
  }
}
