import { authOptions } from '@/lib/auth';
import { SupplierPaymentService } from '@/services/supplier-payment.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Payment history for a specific PO
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const payments = await SupplierPaymentService.getPaymentsByPO(id, tenantId);

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('PO_PAYMENTS_LIST_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
