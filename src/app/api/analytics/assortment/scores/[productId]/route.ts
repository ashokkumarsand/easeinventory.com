import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { AssortmentService } from '@/services/assortment.service';

/**
 * GET /api/analytics/assortment/scores/[productId] — Single product score detail
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> },
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

    const { productId } = await params;

    const result = await AssortmentService.getProductScore(productId, tenantId);
    if (!result) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ASSORTMENT_PRODUCT_SCORE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
