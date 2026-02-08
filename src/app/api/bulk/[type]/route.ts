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
 * GET /api/bulk/:type — Download CSV template
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { type } = await params;
    const operationType = SLUG_TO_TYPE[type];

    if (!operationType) {
      return NextResponse.json({ message: 'Invalid operation type' }, { status: 400 });
    }

    const template = BulkOperationsService.getTemplate(operationType);

    return new NextResponse(template, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-template.csv"`,
      },
    });
  } catch (error: any) {
    console.error('BULK_TEMPLATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/bulk/:type — Upload CSV and return preview
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { type } = await params;
    const operationType = SLUG_TO_TYPE[type];

    if (!operationType) {
      return NextResponse.json({ message: 'Invalid operation type' }, { status: 400 });
    }

    const body = await req.json();
    const csvString = body.csv;

    if (!csvString || typeof csvString !== 'string') {
      return NextResponse.json({ message: 'CSV data is required' }, { status: 400 });
    }

    const parsed = BulkOperationsService.parseCSV(csvString);

    if (parsed.length === 0) {
      return NextResponse.json({ message: 'No data rows found in CSV' }, { status: 400 });
    }

    const preview = await BulkOperationsService.preview(operationType, parsed, tenantId);
    return NextResponse.json(preview);
  } catch (error: any) {
    console.error('BULK_PREVIEW_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
