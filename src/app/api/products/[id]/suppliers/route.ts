import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/products/[id]/suppliers — List suppliers for a product
 */
export async function GET(
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

    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const productSuppliers = await prisma.productSupplier.findMany({
      where: { productId: id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
            city: true,
            avgLeadTimeDays: true,
            reliabilityScore: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ productSuppliers });
  } catch (error: any) {
    console.error('PRODUCT_SUPPLIERS_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/products/[id]/suppliers — Add a supplier to a product
 */
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

    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Verify supplier belongs to tenant
    const supplier = await prisma.supplier.findFirst({
      where: { id: body.supplierId, tenantId },
      select: { id: true },
    });
    if (!supplier) {
      return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    }

    // Check for duplicate
    const existing = await prisma.productSupplier.findUnique({
      where: {
        productId_supplierId: {
          productId: id,
          supplierId: body.supplierId,
        },
      },
    });
    if (existing) {
      return NextResponse.json({ message: 'Supplier already linked to this product' }, { status: 409 });
    }

    const productSupplier = await prisma.productSupplier.create({
      data: {
        productId: id,
        supplierId: body.supplierId,
        unitCost: body.unitCost,
        leadTimeDays: body.leadTimeDays,
        moq: body.moq || 1,
        priority: body.priority || 'BACKUP',
        supplierSku: body.supplierSku || null,
        supplierProductName: body.supplierProductName || null,
        notes: body.notes || null,
      },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(productSupplier, { status: 201 });
  } catch (error: any) {
    console.error('PRODUCT_SUPPLIER_CREATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
