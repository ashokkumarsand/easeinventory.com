import { authOptions } from '@/lib/auth';
import { SupplierPaymentService } from '@/services/supplier-payment.service';
import { logSecurityAction, SecurityAction } from '@/lib/audit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List payables (outstanding POs)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId') || undefined;
    const status = searchParams.get('status') as any || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const result = await SupplierPaymentService.getPayables(
      tenantId,
      { supplierId, status, search },
      page,
      pageSize,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SUPPLIER_PAYABLES_LIST_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}

// POST - Record a payment against a PO
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const body = await req.json();
    const { poId, amount, paymentMode, paymentDate, referenceNumber, notes } = body;

    if (!poId || !amount || !paymentMode || !paymentDate) {
      return NextResponse.json(
        { message: 'poId, amount, paymentMode, and paymentDate are required' },
        { status: 400 },
      );
    }

    const payment = await SupplierPaymentService.recordPayment(
      { poId, amount: Number(amount), paymentMode, paymentDate, referenceNumber, notes },
      tenantId,
      userId,
    );

    await logSecurityAction({
      tenantId,
      userId,
      action: SecurityAction.SUPPLIER_PAYMENT_RECORDED,
      resource: `SupplierPayment:${payment.paymentNumber}`,
      details: { poId, amount, paymentMode },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('SUPPLIER_PAYMENT_RECORD_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: error.message?.includes('not found') ? 404 : 400 },
    );
  }
}
