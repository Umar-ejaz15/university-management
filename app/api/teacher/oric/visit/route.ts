import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { staffId: true } });
  if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

  const body = await req.json();
  if (!body.visitorName?.trim()) return NextResponse.json({ error: 'Visitor name is required' }, { status: 400 });

  const visit = await prisma.industrialVisit.create({
    data: {
      visitorName: body.visitorName.trim(),
      visitorOrg: body.visitorOrg || null,
      visitDate: body.visitDate ? new Date(body.visitDate) : null,
      agenda: body.agenda || null,
      departmentVisited: body.departmentVisited || null,
      visitType: body.visitType || null,
      outcome: body.outcome || null,
      proofUrl: body.proofUrl || null,
      staffId: dbUser.staffId,
      verificationStatus: 'PENDING',
    },
  });
  return NextResponse.json({ visit }, { status: 201 });
}
