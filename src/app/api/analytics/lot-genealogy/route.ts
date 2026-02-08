import { authOptions } from '@/lib/auth';
import { LotGenealogyService } from '@/services/lot-genealogy.service';
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
    const lotId = searchParams.get('lotId');
    const mode = searchParams.get('mode'); // 'trace' | 'recall' | 'dashboard'

    if (mode === 'trace' && lotId) {
      const data = await LotGenealogyService.forwardTrace(tenantId, lotId);
      return NextResponse.json(data);
    }

    if (mode === 'recall' && lotId) {
      const data = await LotGenealogyService.simulateRecall(tenantId, lotId);
      return NextResponse.json(data);
    }

    const data = await LotGenealogyService.getDashboard(tenantId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[LOT_GENEALOGY_GET]', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
