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

// PUT /api/admin/labs/[id] — update lab
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, floor, labInCharge, description } = body;

  if (!name?.trim() || !floor?.trim() || !labInCharge?.trim()) {
    return NextResponse.json({ error: 'Name, floor, and lab-in-charge are required' }, { status: 400 });
  }

  const lab = await prisma.lab.update({
    where: { id },
    data: { name: name.trim(), floor: floor.trim(), labInCharge: labInCharge.trim(), description: description?.trim() || null },
    include: { equipment: { orderBy: { srNo: 'asc' } } },
  });

  return NextResponse.json({ lab });
}

// DELETE /api/admin/labs/[id] — delete lab
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.lab.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
