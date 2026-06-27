import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [patents, disclosures, licensing] = await Promise.all([
    prisma.patent.findMany({
      include: {
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
      orderBy: { filingDate: 'desc' },
    }),
    prisma.iPDisclosure.findMany({
      include: {
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.iPLicensing.findMany({
      include: {
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return NextResponse.json({ patents, disclosures, licensing });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
  if (!body.staffId) return NextResponse.json({ error: 'Faculty (staffId) is required' }, { status: 400 });
  const { type } = body;

  if (type === 'disclosure') {
    const item = await prisma.iPDisclosure.create({
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
        verificationStatus: 'VERIFIED',
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
    });
    return NextResponse.json({ item }, { status: 201 });
  }

  if (type === 'licensing') {
    const item = await prisma.iPLicensing.create({
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
        verificationStatus: 'VERIFIED',
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
    });
    return NextResponse.json({ item }, { status: 201 });
  }

  // default: patent
  const item = await prisma.patent.create({
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
      verificationStatus: 'VERIFIED',
    },
    include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
  });
  return NextResponse.json({ item }, { status: 201 });
}
