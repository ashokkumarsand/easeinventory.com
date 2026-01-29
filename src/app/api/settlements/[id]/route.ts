import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Mark settlement as PAID
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { status } = body; // PAID or UNSETTLED

    const settlement = await prisma.consignmentSettlement.findUnique({
      where: { id }
    });

    if (!settlement || settlement.tenantId !== tenantId) {
      return NextResponse.json({ message: 'Settlement record not found' }, { status: 404 });
    }

    const updated = await prisma.consignmentSettlement.update({
      where: { id },
      data: {
        status,
        settledAt: status === 'PAID' ? new Date() : null
      }
    });

    return NextResponse.json({
      message: 'Settlement status updated',
      settlement: updated
    });

  } catch (error: any) {
    console.error('SETTLEMENT_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
