import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dashboard/stock-flow
 * Returns aggregated stock flow data (purchases, sales) for charts
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Cast to extended session type
    const userSession = session?.user as { tenantId?: string } | undefined;
    
    if (!userSession?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = userSession.tenantId;
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'weekly';

    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week';

    if (range === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      groupBy = 'week';
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
    }

    // Fetch invoices for sales data
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Fetch stock movements for purchases data
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        product: { tenantId },
        createdAt: { gte: startDate },
        type: 'PURCHASE',
      },
      select: {
        createdAt: true,
        quantity: true,
      },
    });

    // Aggregate data
    const aggregatedData: Record<string, { purchases: number; sales: number; repairs: number }> = {};

    const formatDate = (date: Date) => {
      if (groupBy === 'day') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
      } else {
        const weekNum = Math.ceil((date.getDate()) / 7);
        return `Week ${weekNum}`;
      }
    };

    // Initialize all days/weeks
    if (groupBy === 'day') {
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
        aggregatedData[day] = { purchases: 0, sales: 0, repairs: 0 };
      });
    } else {
      ['Week 1', 'Week 2', 'Week 3', 'Week 4'].forEach(week => {
        aggregatedData[week] = { purchases: 0, sales: 0, repairs: 0 };
      });
    }

    // Process invoices (sales)
    invoices.forEach((invoice) => {
      const key = formatDate(invoice.createdAt);
      if (aggregatedData[key]) {
        aggregatedData[key].sales += 1;
      }
    });

    // Process stock movements (purchases)
    stockMovements.forEach((movement) => {
      const key = formatDate(movement.createdAt);
      if (aggregatedData[key]) {
        aggregatedData[key].purchases += movement.quantity;
      }
    });

    // Convert to array and sort
    const data = Object.entries(aggregatedData).map(([name, values]) => ({
      name,
      ...values,
    }));

    // Sort by day order for weekly view
    if (groupBy === 'day') {
      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data.sort((a, b) => dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name));
    } else {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({ data, range });
  } catch (error) {
    console.error('Stock flow API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock flow data' },
      { status: 500 }
    );
  }
}

