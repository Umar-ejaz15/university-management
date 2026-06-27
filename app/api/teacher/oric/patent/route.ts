import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { staffId: true } });
  if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const type = body.type || 'patent';

  if (type === 'disclosure') {
    const record = await prisma.iPDisclosure.create({
      data: {
        title: body.title.trim(),
        leadInventor: body.leadInventor || null,
        designation: body.designation || null,
        department: body.department || null,
        ipCategory: body.ipCategory || null,
        developmentStatus: body.developmentStatus || null,
        scope: body.scope || 'NATIONAL',
        keyAspects: body.keyAspects || null,
        commercialPartner: body.commercialPartner || null,
        financialSupport: body.financialSupport || null,
        disclosureMadeWith: body.disclosureMadeWith || null,
        previousDisclosure: body.previousDisclosure || null,
        annexRef: body.annexRef || null,
        documentUrl: body.documentUrl || null,
        staffId: dbUser.staffId,
        verificationStatus: 'PENDING',
      },
    });
    return NextResponse.json({ record }, { status: 201 });
  }

  if (type === 'licensing') {
    const record = await prisma.iPLicensing.create({
      data: {
        title: body.title.trim(),
        leadInventor: body.leadInventor || null,
        designationDept: body.designationDept || null,
        ipCategory: body.ipCategory || null,
        developmentStatus: body.developmentStatus || null,
        scope: body.scope || 'NATIONAL',
        keyAspects: body.keyAspects || null,
        fieldOfUse: body.fieldOfUse || null,
        agreementDuration: body.agreementDuration || null,
        negotiationStatus: body.negotiationStatus || null,
        licenseeName: body.licenseeName || null,
        annexRef: body.annexRef || null,
        documentUrl: body.documentUrl || null,
        staffId: dbUser.staffId,
        verificationStatus: 'PENDING',
      },
    });
    return NextResponse.json({ record }, { status: 201 });
  }

  // default: patent
  const record = await prisma.patent.create({
    data: {
      title: body.title.trim(),
      leadInventor: body.leadInventor || null,
      designation: body.designation || null,
      department: body.department || null,
      coInventors: body.coInventors || null,
      ipCategory: body.ipCategory || null,
      developmentStatus: body.developmentStatus || null,
      keyAspects: body.keyAspects || null,
      commercialPartner: body.commercialPartner || null,
      financialSupport: body.financialSupport || null,
      filedWith: body.filedWith || null,
      scope: body.scope || 'NATIONAL',
      filingDate: body.filingDate ? new Date(body.filingDate) : null,
      applicationNumber: body.applicationNumber || null,
      patentStatus: body.patentStatus || null,
      filingProofUrl: body.filingProofUrl || null,
      annexRef: body.annexRef || null,
      staffId: dbUser.staffId,
      verificationStatus: 'PENDING',
    },
  });
  return NextResponse.json({ record }, { status: 201 });
}
