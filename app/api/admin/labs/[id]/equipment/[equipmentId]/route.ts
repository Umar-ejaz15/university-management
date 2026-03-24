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

// PUT /api/admin/labs/[id]/equipment/[equipmentId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; equipmentId: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { equipmentId } = await params;
  const body = await req.json();
  const { name, model, quantity, srNo, notes } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Equipment name is required' }, { status: 400 });
  }

  const equipment = await prisma.equipment.update({
    where: { id: equipmentId },
    data: {
      name: name.trim(),
      model: model?.trim() || null,
      quantity: Number(quantity) || 1,
      srNo: srNo ? Number(srNo) : null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({ equipment });
}

// DELETE /api/admin/labs/[id]/equipment/[equipmentId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; equipmentId: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { equipmentId } = await params;
  await prisma.equipment.delete({ where: { id: equipmentId } });
  return NextResponse.json({ success: true });
}
