import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { logError } from '@/lib/logger';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'ORIC') return null;
  return payload;
}

type VerifType = 'profile' | 'publication' | 'project' | 'course' | 'mou' | 'consultancy' | 'patent' | 'disclosure' | 'licensing' | 'visit' | 'event' | 'policy';

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

  const validTypes: VerifType[] = ['profile', 'publication', 'project', 'course', 'mou', 'consultancy', 'patent', 'disclosure', 'licensing', 'visit', 'event', 'policy'];
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

      case 'project': {
        // Approving a freshly-submitted project moves it into the ONGOING phase.
        const current = await prisma.project.findUnique({
          where: { id },
          select: { status: true },
        });
        const nextStatus =
          action === 'VERIFIED' && current?.status === 'SUBMITTED' ? 'ONGOING' : undefined;
        await prisma.project.update({
          where: { id },
          data: {
            verificationStatus: action,
            rejectionReason: action === 'REJECTED' ? reason!.trim() : null,
            ...(nextStatus ? { status: nextStatus } : {}),
          },
        });
        break;
      }

      case 'course':
        await prisma.course.update({
          where: { id },
          data: {
            verificationStatus: action,
            rejectionReason: action === 'REJECTED' ? reason!.trim() : null,
          },
        });
        break;

      case 'mou':
        await prisma.mou.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;

      case 'consultancy':
        await prisma.consultancy.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;

      case 'patent':
        await prisma.patent.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;

      case 'disclosure':
        await prisma.iPDisclosure.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;

      case 'licensing':
        await prisma.iPLicensing.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;

      case 'visit':
        await prisma.industrialVisit.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;

      case 'event':
        await prisma.event.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;

      case 'policy':
        await prisma.policyAdvocacy.update({
          where: { id },
          data: { verificationStatus: action, rejectionReason: action === 'REJECTED' ? reason!.trim() : null },
        });
        break;
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    logError('Verification error:', err);
    return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
  }
}
