import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { BulkOperationsService, BulkOperationType } from '@/services/bulk-operations.service';

// ============================================================
// Slug to type mapping
// ============================================================

const SLUG_TO_TYPE: Record<string, BulkOperationType> = {
  'price-update': 'PRICE_UPDATE',
  'inventory-adjustment': 'INVENTORY_ADJUSTMENT',
  'customer-import': 'CUSTOMER_IMPORT',
  'supplier-import': 'SUPPLIER_IMPORT',
};

/**
 * POST /api/bulk/:type/apply — Apply validated bulk changes
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { type } = await params;
    const operationType = SLUG_TO_TYPE[type];

    if (!operationType) {
      return NextResponse.json({ message: 'Invalid operation type' }, { status: 400 });
    }

    const body = await req.json();
    const data = body.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ message: 'No data to apply' }, { status: 400 });
    }

    const result = await BulkOperationsService.apply(operationType, data, tenantId, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('BULK_APPLY_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
