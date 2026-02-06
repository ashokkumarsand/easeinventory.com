import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * PATCH /api/products/[id]/suppliers/[supplierId] — Update a product-supplier link
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; supplierId: string }> },
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

    const { id, supplierId } = await params;
    const body = await req.json();

    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const existing = await prisma.productSupplier.findUnique({
      where: {
        productId_supplierId: {
          productId: id,
          supplierId,
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ message: 'Product-supplier link not found' }, { status: 404 });
    }

    const updated = await prisma.productSupplier.update({
      where: {
        productId_supplierId: {
          productId: id,
          supplierId,
        },
      },
      data: {
        ...(body.unitCost !== undefined && { unitCost: body.unitCost }),
        ...(body.leadTimeDays !== undefined && { leadTimeDays: body.leadTimeDays }),
        ...(body.moq !== undefined && { moq: body.moq }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.supplierSku !== undefined && { supplierSku: body.supplierSku }),
        ...(body.supplierProductName !== undefined && { supplierProductName: body.supplierProductName }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PRODUCT_SUPPLIER_UPDATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]/suppliers/[supplierId] — Remove supplier from product
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; supplierId: string }> },
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

    const { id, supplierId } = await params;

    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const existing = await prisma.productSupplier.findUnique({
      where: {
        productId_supplierId: {
          productId: id,
          supplierId,
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ message: 'Product-supplier link not found' }, { status: 404 });
    }

    await prisma.productSupplier.delete({
      where: {
        productId_supplierId: {
          productId: id,
          supplierId,
        },
      },
    });

    return NextResponse.json({ message: 'Removed' });
  } catch (error: any) {
    console.error('PRODUCT_SUPPLIER_DELETE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
