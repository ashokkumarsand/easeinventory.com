import { authOptions } from '@/lib/auth';
import { ReturnService } from '@/services/return.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Initiate refund for return
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
    const body = await req.json();

    if (!body.refundAmount) {
      return NextResponse.json(
        { message: 'Refund amount is required' },
        { status: 400 },
      );
    }
    if (!body.refundMode) {
      return NextResponse.json(
        { message: 'Refund mode is required' },
        { status: 400 },
      );
    }

    const returnOrder = await ReturnService.initiateRefund(
      id,
      tenantId,
      body.refundAmount,
      body.refundMode,
      body.restockApproved || false,
    );

    return NextResponse.json({ message: 'Refund initiated', returnOrder });
  } catch (error: any) {
    console.error('RETURN_REFUND_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
