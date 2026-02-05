import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch lots for a product or all lots
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const lots = await prisma.productLot.findMany({
      where: {
        tenantId,
        ...(productId && { productId }),
        isActive: true,
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true }
        },
        supplier: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ lots });
  } catch (error) {
    console.error('Get lots error:', error);
    return NextResponse.json({ error: 'Failed to fetch lots' }, { status: 500 });
  }
}

// POST - Create a new lot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      productId,
      lotNumber,
      batchNumber,
      quantity,
      costPrice,
      manufacturingDate,
      expiryDate,
      purchaseDate,
      supplierId,
      notes,
    } = body;

    if (!productId || !lotNumber || !quantity || costPrice === undefined) {
      return NextResponse.json(
        { error: 'Product ID, lot number, quantity, and cost price are required' },
        { status: 400 }
      );
    }

    // Check if lot number already exists for this product
    const existing = await prisma.productLot.findFirst({
      where: {
        productId,
        lotNumber,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Lot number already exists for this product' },
        { status: 409 }
      );
    }

    // Create the lot
    const lot = await prisma.productLot.create({
      data: {
        productId,
        lotNumber,
        batchNumber,
        quantity: parseInt(quantity),
        initialQuantity: parseInt(quantity),
        costPrice: parseFloat(costPrice),
        manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        supplierId: supplierId || null,
        notes,
        tenantId,
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true }
        }
      }
    });

    // Update the product's total quantity
    await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: parseInt(quantity)
        }
      }
    });

    return NextResponse.json({ lot }, { status: 201 });
  } catch (error) {
    console.error('Create lot error:', error);
    return NextResponse.json({ error: 'Failed to create lot' }, { status: 500 });
  }
}

// PUT - Update a lot
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, quantity, costPrice, expiryDate, notes, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lot ID is required' }, { status: 400 });
    }

    // Get current lot to calculate quantity difference
    const currentLot = await prisma.productLot.findFirst({
      where: { id, tenantId }
    });

    if (!currentLot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    const quantityDiff = quantity !== undefined
      ? parseInt(quantity) - currentLot.quantity
      : 0;

    // Update the lot
    const lot = await prisma.productLot.update({
      where: { id },
      data: {
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Update product quantity if lot quantity changed
    if (quantityDiff !== 0) {
      await prisma.product.update({
        where: { id: currentLot.productId },
        data: {
          quantity: {
            increment: quantityDiff
          }
        }
      });
    }

    return NextResponse.json({ lot });
  } catch (error) {
    console.error('Update lot error:', error);
    return NextResponse.json({ error: 'Failed to update lot' }, { status: 500 });
  }
}
