import { authOptions } from '@/lib/auth';
import { MultiEchelonService } from '@/services/multi-echelon.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    if (mode === 'alerts') {
      const data = await MultiEchelonService.getAlerts(tenantId);
      return NextResponse.json(data);
    }

    const lookbackDays = parseInt(searchParams.get('lookbackDays') || '90');
    const serviceLevel = parseFloat(searchParams.get('serviceLevel') || '0.95');

    const data = await MultiEchelonService.getDashboard(tenantId, lookbackDays, serviceLevel);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[MULTI_ECHELON_GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
