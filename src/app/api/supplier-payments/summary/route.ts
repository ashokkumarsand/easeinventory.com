import { authOptions } from '@/lib/auth';
import { SupplierPaymentService } from '@/services/supplier-payment.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// GET - Payables summary with aging buckets
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const summary = await SupplierPaymentService.getPayablesSummary(tenantId);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('PAYABLES_SUMMARY_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
