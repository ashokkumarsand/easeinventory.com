import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { TransshipmentService } from '@/services/transshipment.service';

/**
 * GET /api/transshipments — List transshipments or get suggestions
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('mode'); // 'suggestions' or default (list)

    if (mode === 'suggestions') {
      const suggestions = await TransshipmentService.getSuggestions(tenantId);
      return NextResponse.json({ suggestions });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const emergencyOnly = searchParams.get('emergencyOnly') === 'true';

    const result = await TransshipmentService.list(tenantId, page, pageSize, emergencyOnly);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('TRANSSHIPMENT_LIST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/transshipments — Create a lateral transshipment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const body = await req.json();
    const result = await TransshipmentService.create(tenantId, userId, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('TRANSSHIPMENT_CREATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
