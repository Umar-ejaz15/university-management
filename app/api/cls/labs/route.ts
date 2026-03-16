import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/cls/labs
 * Return all labs with equipment and per-equipment active loan count.
 * Public endpoint — no authentication required.
 */
export async function GET() {
  try {
    const labs = await prisma.lab.findMany({
      include: {
        equipment: {
          include: {
            _count: {
              select: {
                requests: {
                  where: { status: 'APPROVED' },
                },
              },
            },
          },
          orderBy: { srNo: 'asc' },
        },
      },
      orderBy: { floor: 'asc' },
    });

    // Compute availableQty for each equipment item
    const labsWithAvailability = labs.map((lab) => ({
      ...lab,
      equipment: lab.equipment.map((eq) => ({
        ...eq,
        activeLoans: eq._count.requests,
        availableQty: Math.max(0, eq.quantity - eq._count.requests),
        _count: undefined, // strip internal count
      })),
    }));

    return NextResponse.json({ labs: labsWithAvailability }, { status: 200 });
  } catch (error) {
    console.error('Error fetching labs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labs' },
      { status: 500 }
    );
  }
}
