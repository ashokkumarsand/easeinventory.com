import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all transfers
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const transfers = await prisma.stockTransfer.findMany({
      where: { tenantId },
      include: {
        sourceLocation: { select: { name: true } },
        destLocation: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ transfers });

  } catch (error: any) {
    console.error('TRANSFERS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Initiate a transfer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const body = await req.json();
    const { sourceLocationId, destLocationId, items, notes } = body;

    if (!sourceLocationId || !destLocationId || !items || items.length === 0) {
      return NextResponse.json({ message: 'Source, destination and items are required' }, { status: 400 });
    }

    // Generate transfer number
    const count = await prisma.stockTransfer.count({ where: { tenantId } });
    const transferNumber = `TRF-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Transaction to create transfer and adjust source stock
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create the transfer record
      const transfer = await tx.stockTransfer.create({
        data: {
          transferNumber,
          sourceLocationId,
          destLocationId,
          notes,
          createdById: userId,
          tenantId,
          status: 'PENDING',
          items: {
            create: items.map((it: any) => ({
              productId: it.productId,
              quantity: it.quantity
            }))
          }
        },
        include: {
            items: true
        }
      });

      // 2. Reduce stock from source location
      // For each item, we need to check if enough stock exists and then deduct
      for (const item of items) {
        const stockAtSource = await tx.stockAtLocation.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: sourceLocationId
            }
          }
        });

        if (!stockAtSource || stockAtSource.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId} at source location`);
        }

        await tx.stockAtLocation.update({
          where: { id: stockAtSource.id },
          data: { quantity: { decrement: item.quantity } }
        });
        
        // Also update the global product quantity (assuming global quantity is sum of all locations)
        await tx.product.update({
           where: { id: item.productId },
           data: { quantity: { decrement: item.quantity } }
        });
      }

      return transfer;
    });

    return NextResponse.json({
      message: 'Transfer initiated successfully',
      transfer: result
    }, { status: 201 });

  } catch (error: any) {
    console.error('TRANSFER_POST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
