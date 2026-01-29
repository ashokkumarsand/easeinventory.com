import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all settlements for tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');

    const where: any = { tenantId };
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const settlements = await prisma.consignmentSettlement.findMany({
      where,
      include: {
        product: {
          select: { name: true, sku: true }
        },
        supplier: {
          select: { name: true }
        },
        invoice: {
          select: { invoiceNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ settlements });

  } catch (error: any) {
    console.error('SETTLEMENTS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
