import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  if (!body.staffId) return NextResponse.json({ error: 'Faculty (staffId) is required' }, { status: 400 });
  const { type } = body;

  if (type === 'disclosure') {
    const item = await prisma.iPDisclosure.update({
      where: { id },
      data: {
        title: body.title,
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
        staffId: body.staffId,
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
    });
    return NextResponse.json({ item });
  }

  if (type === 'licensing') {
    const item = await prisma.iPLicensing.update({
      where: { id },
      data: {
        title: body.title,
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
        staffId: body.staffId,
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
    });
    return NextResponse.json({ item });
  }

  // default: patent
  const item = await prisma.patent.update({
    where: { id },
    data: {
      title: body.title,
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
      ipoLastActionDate: body.ipoLastActionDate ? new Date(body.ipoLastActionDate) : null,
      ipoStatus: body.ipoStatus || null,
      ipoExaminer: body.ipoExaminer || null,
      ipoComments: body.ipoComments || null,
      staffId: body.staffId,
    },
    include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'disclosure') {
    await prisma.iPDisclosure.delete({ where: { id } });
  } else if (type === 'licensing') {
    await prisma.iPLicensing.delete({ where: { id } });
  } else {
    await prisma.patent.delete({ where: { id } });
  }
  return NextResponse.json({ ok: true });
}
