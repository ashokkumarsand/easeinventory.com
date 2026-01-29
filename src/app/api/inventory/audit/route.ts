import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List stock movements with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { tenantId };

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          },
          supplier: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ]);

    // Get summary stats
    const stats = await prisma.stockMovement.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: true,
      _sum: { quantity: true }
    });

    return NextResponse.json({
      movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error: any) {
    console.error('AUDIT_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create a manual adjustment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    
    // Only managers and above can create adjustments
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN', 'ACCOUNTANT'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { productId, type, quantity, notes } = body;

    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { message: 'Product, type, and quantity are required' },
        { status: 400 }
      );
    }

    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId }
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Calculate new quantity based on movement type
    let newQuantity = product.quantity;
    const adjustedQty = Math.abs(parseInt(quantity));

    if (['PURCHASE', 'RETURN_IN', 'REPAIR_IN'].includes(type)) {
      newQuantity += adjustedQty;
    } else if (['SALE', 'RETURN_OUT', 'DAMAGE', 'REPAIR_OUT'].includes(type)) {
      newQuantity -= adjustedQty;
      if (newQuantity < 0) {
        return NextResponse.json(
          { message: 'Insufficient stock for this operation' },
          { status: 400 }
        );
      }
    } else if (type === 'ADJUSTMENT') {
      // Direct adjustment - quantity can be positive or negative
      newQuantity += parseInt(quantity);
      if (newQuantity < 0) {
        return NextResponse.json(
          { message: 'Stock cannot go below zero' },
          { status: 400 }
        );
      }
    }

    // Create movement and update product in transaction
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          type,
          quantity: parseInt(quantity),
          productId,
          userId,
          tenantId,
          notes
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity }
      })
    ]);

    return NextResponse.json({
      message: 'Stock movement recorded',
      movement
    }, { status: 201 });

  } catch (error: any) {
    console.error('AUDIT_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
