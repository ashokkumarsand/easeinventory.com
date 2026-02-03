import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/inventory/low-stock
 * Returns products that are below their minimum stock threshold
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userSession = session?.user as { tenantId?: string } | undefined;
    
    if (!userSession?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = userSession.tenantId;

    // Fetch products with low stock
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        minStock: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Filter products below minimum stock
    const lowStockItems = products
      .filter((p) => p.quantity <= (p.minStock || 5))
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || 'N/A',
        currentStock: p.quantity,
        minStock: p.minStock || 5,
        category: p.category?.name || 'General',
      }))
      .sort((a, b) => (a.currentStock / a.minStock) - (b.currentStock / b.minStock));

    return NextResponse.json({ items: lowStockItems, total: lowStockItems.length });
  } catch (error) {
    console.error('Low stock API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}
