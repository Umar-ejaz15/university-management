import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { staffId: true } });
  if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

  const body = await req.json();
  if (!body.govtBody?.trim()) return NextResponse.json({ error: 'Government body is required' }, { status: 400 });

  const policy = await prisma.policyAdvocacy.create({
    data: {
      govtBody: body.govtBody.trim(),
      areaAdvocated: body.areaAdvocated || null,
      brief: body.brief || null,
      coalitionPartners: body.coalitionPartners || null,
      advocacyTools: body.advocacyTools || null,
      annexRef: body.annexRef || null,
      staffId: dbUser.staffId,
      verificationStatus: 'PENDING',
    },
  });
  return NextResponse.json({ policy }, { status: 201 });
}
