import { authOptions } from '@/lib/auth';
import { SupplierPaymentService } from '@/services/supplier-payment.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Credit utilization per supplier
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

    const creditStatus = await SupplierPaymentService.getSupplierCreditStatus(tenantId, supplierId);
    return NextResponse.json(creditStatus);
  } catch (error: any) {
    console.error('CREDIT_STATUS_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
