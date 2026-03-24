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

type VerifType = 'profile' | 'publication' | 'project' | 'course';

/**
 * PUT /api/admin/verifications/[type]/[id]
 * Body: { action: 'VERIFIED' | 'REJECTED', reason?: string }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, id } = await params;
  const body = await req.json();
  const { action, reason } = body as { action: 'VERIFIED' | 'REJECTED'; reason?: string };

  if (!['VERIFIED', 'REJECTED'].includes(action)) {
    return NextResponse.json({ error: 'action must be VERIFIED or REJECTED' }, { status: 400 });
  }
  if (action === 'REJECTED' && (!reason || reason.trim().length < 5)) {
    return NextResponse.json({ error: 'A rejection reason is required (min 5 chars)' }, { status: 400 });
  }

  const validTypes: VerifType[] = ['profile', 'publication', 'project', 'course'];
  if (!validTypes.includes(type as VerifType)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    switch (type as VerifType) {
      case 'profile':
        await prisma.staff.update({
          where: { id },
          data: {
            profileVerificationStatus: action,
            profileRejectionReason: action === 'REJECTED' ? reason!.trim() : null,
          },
        });
        break;

      case 'publication':
        await prisma.publication.update({
          where: { id },
          data: {
            verificationStatus: action,
            verified: action === 'VERIFIED',
            rejectionReason: action === 'REJECTED' ? reason!.trim() : null,
          },
        });
        break;

      case 'project':
        await prisma.project.update({
          where: { id },
          data: {
            verificationStatus: action,
            rejectionReason: action === 'REJECTED' ? reason!.trim() : null,
          },
        });
        break;

      case 'course':
        await prisma.course.update({
          where: { id },
          data: {
            verificationStatus: action,
            rejectionReason: action === 'REJECTED' ? reason!.trim() : null,
          },
        });
        break;
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
  }
}
