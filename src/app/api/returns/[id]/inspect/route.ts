import { authOptions } from '@/lib/auth';
import { ReturnService } from '@/services/return.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Inspect return items
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
    const userId = (session.user as any).id;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { message: 'Inspection items are required' },
        { status: 400 },
      );
    }

    const returnOrder = await ReturnService.inspect(
      id,
      tenantId,
      userId,
      body.items,
      body.inspectionNotes,
    );

    return NextResponse.json({ message: 'Return inspected', returnOrder });
  } catch (error: any) {
    console.error('RETURN_INSPECT_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
