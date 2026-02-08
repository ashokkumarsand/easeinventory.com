import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { AssortmentService } from '@/services/assortment.service';

/**
 * GET /api/analytics/assortment/suggestions — Optimization suggestions
 */
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

    const result = await AssortmentService.generateSuggestions(tenantId);
    return NextResponse.json({ suggestions: result, total: result.length });
  } catch (error: any) {
    console.error('ASSORTMENT_SUGGESTIONS_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
