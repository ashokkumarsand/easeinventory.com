import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/analytics/reorder-suggestions/[id]/convert — Convert to PO
 */
export async function POST(
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

    // Get the suggestion
    const suggestion = await prisma.reorderSuggestion.findFirst({
      where: { id, tenantId },
      include: {
        product: { select: { id: true, name: true, sku: true, costPrice: true, hsnCode: true } },
      },
    });

    if (!suggestion) {
      return NextResponse.json({ message: 'Suggestion not found' }, { status: 404 });
    }

    if (!suggestion.supplierId) {
      return NextResponse.json({ message: 'No supplier linked to this product. Set a supplier first.' }, { status: 400 });
    }

    // Mark as converted
    await prisma.reorderSuggestion.update({
      where: { id },
      data: { status: 'CONVERTED_TO_PO' },
    });

    return NextResponse.json({
      success: true,
      message: 'Suggestion marked as converted. Create a PO from the Purchase Orders page.',
      suggestion: {
        productName: suggestion.product.name,
        suggestedQty: suggestion.suggestedQty,
        supplierId: suggestion.supplierId,
        estimatedCost: Number(suggestion.estimatedCost),
      },
    });
  } catch (error: any) {
    console.error('REORDER_CONVERT_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
