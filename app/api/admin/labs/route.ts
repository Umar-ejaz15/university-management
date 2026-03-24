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

// GET /api/admin/labs — list all labs with equipment
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const labs = await prisma.lab.findMany({
    include: { equipment: { orderBy: { srNo: 'asc' } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ labs });
}

// POST /api/admin/labs — create a lab
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, floor, labInCharge, description } = body;

  if (!name?.trim() || !floor?.trim() || !labInCharge?.trim()) {
    return NextResponse.json({ error: 'Name, floor, and lab-in-charge are required' }, { status: 400 });
  }

  const lab = await prisma.lab.create({
    data: { name: name.trim(), floor: floor.trim(), labInCharge: labInCharge.trim(), description: description?.trim() || null },
    include: { equipment: true },
  });

  return NextResponse.json({ lab }, { status: 201 });
}
