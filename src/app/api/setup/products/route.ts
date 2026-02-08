import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'At least one product is required' }, { status: 400 });
    }

    // Validate each product has a name
    for (const p of products) {
      if (!p.name?.trim()) {
        return NextResponse.json({ error: 'All products must have a name' }, { status: 400 });
      }
    }

    const created = await prisma.$transaction(
      products.map((p: any) =>
        prisma.product.create({
          data: {
            name: p.name.trim(),
            sku: p.sku?.trim() || null,
            ...(p.salePrice && { salePrice: parseFloat(p.salePrice) }),
            ...(p.costPrice && { costPrice: parseFloat(p.costPrice) }),
            quantity: p.quantity ? parseInt(p.quantity) : 0,
            unit: p.unit || 'pcs',
            categoryId: p.categoryId || null,
            tenantId,
          },
        })
      )
    );

    // Update setup progress
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const currentSettings = (tenant?.settings as any) || {};

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...currentSettings,
          setupProgress: {
            ...currentSettings.setupProgress,
            products: true,
          },
        },
      },
    });

    return NextResponse.json({ message: `Created ${created.length} products`, created: created.length });
  } catch (error) {
    console.error('[SETUP_PRODUCTS]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
