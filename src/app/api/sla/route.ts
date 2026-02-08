import { authOptions } from '@/lib/auth';
import { SlaService } from '@/services/sla.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Dashboard or single supplier SLA
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const lookbackDays = parseInt(searchParams.get('lookbackDays') || '180');

    if (supplierId) {
      const sla = await SlaService.getSlaDefinition(tenantId, supplierId);
      return NextResponse.json({ sla });
    }

    const data = await SlaService.getDashboard(tenantId, lookbackDays);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SLA_GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - Set SLA definition for a supplier
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { supplierId, maxLeadTimeDays, minFillRatePct, maxDefectRatePct, penaltyPerBreachPct } = body;

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId is required' }, { status: 400 });
    }

    await SlaService.setSlaDefinition(tenantId, supplierId, {
      maxLeadTimeDays: maxLeadTimeDays ?? 14,
      minFillRatePct: minFillRatePct ?? 90,
      maxDefectRatePct: maxDefectRatePct ?? 5,
      penaltyPerBreachPct: penaltyPerBreachPct ?? 2,
    });

    return NextResponse.json({ message: 'SLA definition saved' });
  } catch (error: any) {
    console.error('[SLA_POST]', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
