import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { RefurbishmentService } from '@/services/refurbishment.service';

/**
 * GET /api/refurbishment — Refurbishment queue
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const result = await RefurbishmentService.getQueue(tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('REFURBISHMENT_QUEUE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/refurbishment — Grade a return item
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const body = await req.json();
    const result = await RefurbishmentService.gradeItem(tenantId, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('REFURBISHMENT_GRADE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
