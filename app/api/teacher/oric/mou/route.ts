import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { staffId: true } });
  if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

  const body = await req.json();
  if (!body.partyName?.trim()) return NextResponse.json({ error: 'Party name is required' }, { status: 400 });

  const mou = await prisma.mou.create({
    data: {
      partyName: body.partyName.trim(),
      linkageType: body.linkageType || null,
      partyType: body.partyType || null,
      establishmentDate: body.establishmentDate ? new Date(body.establishmentDate) : null,
      scope: body.scope || 'NATIONAL',
      country: body.country || null,
      duration: body.duration || null,
      status: body.status || null,
      focalPersonMnsuam: body.focalPersonMnsuam || null,
      focalPersonOther: body.focalPersonOther || null,
      scopeOfCollaboration: body.scopeOfCollaboration || null,
      activities: body.activities || null,
      futureInitiatives: body.futureInitiatives || null,
      annexRef: body.annexRef || null,
      documentUrl: body.documentUrl || null,
      staffId: dbUser.staffId,
      verificationStatus: 'PENDING',
    },
  });
  return NextResponse.json({ mou }, { status: 201 });
}
