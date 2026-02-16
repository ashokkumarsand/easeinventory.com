import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all products/items for tenant
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

    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { tenantId };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    let products: any[] = [];
    let total = 0;

    try {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true } },
            supplier: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
    } catch (queryError: any) {
      console.error('PRODUCTS_QUERY_ERROR:', queryError?.message);
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error: any) {
    console.error('PRODUCTS_LIST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new product/item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!['OWNER', 'ADMIN', 'INVENTORY_MANAGER', 'STAFF'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      name,           // Required
      sku,            // Optional
      barcode,        // Optional
      description,
      categoryId,
      costPrice,      // Purchase cost
      mrp,            // Maximum retail price
      salePrice,      // Actual selling price
      discountPercent,
      quantity,
      unit,
      images,         // Array of image URLs
      serialNumber,   // For high-value items
      lotNumber,      // For batch tracking
      supplierId,     // Primary supplier
      initialLocationId, // Optional: for starting stock
      customFields,   // User-defined key-value pairs
    } = body;

    if (!name) {
      return NextResponse.json({ message: 'Product name is required' }, { status: 400 });
    }

    const product = await prisma.$transaction(async (tx: any) => {
      const p = await tx.product.create({
        data: {
          name,
          sku: sku || null,
          barcode: barcode || null,
          description: description || null,
          categoryId: categoryId || null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          mrp: mrp ? parseFloat(mrp) : null,
          salePrice: salePrice ? parseFloat(salePrice) : null,
          discountPercent: discountPercent ? parseFloat(discountPercent) : null,
          quantity: quantity ? parseInt(quantity) : 0,
          unit: unit || 'pcs',
          supplierId: supplierId || null,
          ...(serialNumber && { 
            customFields: { 
              ...customFields, 
              serialNumber, 
              lotNumber,
              addedBy: userId,
              addedAt: new Date().toISOString()
            } 
          }),
          tenantId
        }
      });

      // If initial stock and location provided, create the relation
      if (initialLocationId && quantity && parseInt(quantity) > 0) {
        await tx.stockAtLocation.create({
          data: {
            productId: p.id,
            locationId: initialLocationId,
            quantity: parseInt(quantity)
          }
        });
      }

      return p;
    });

    return NextResponse.json({
      message: 'Item added successfully',
      product
    }, { status: 201 });

  } catch (error: any) {
    console.error('PRODUCT_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
