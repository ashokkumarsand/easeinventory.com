import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update transfer status (e.g., mark as COMPLETED)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const { status } = await req.json();

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!transfer || transfer.tenantId !== tenantId) {
      return NextResponse.json({ message: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') {
        return NextResponse.json({ message: 'Transfer is already final' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
        // 1. Update transfer status
        const updated = await tx.stockTransfer.update({
            where: { id },
            data: { 
                status,
                ...(status === 'COMPLETED' ? { approvedById: userId } : {})
            }
        });

        // 2. If COMPLETED, increase stock at destination
        if (status === 'COMPLETED') {
            for (const item of transfer.items) {
                await tx.stockAtLocation.upsert({
                    where: {
                        productId_locationId: {
                            productId: item.productId,
                            locationId: transfer.destLocationId
                        }
                    },
                    update: { quantity: { increment: item.quantity } },
                    create: {
                        productId: item.productId,
                        locationId: transfer.destLocationId,
                        quantity: item.quantity
                    }
                });

                // Update global product quantity (it was decremented on initiation, now we add it back as it reaches destination)
                // Actually, if "Company Stock" = sum of all locations, then global quantity shouldn't change *during* move?
                // But usually, "Available Stock" = On hand. 
                // Let's assume global quantity = Sum(all locations).
                await tx.product.update({
                    where: { id: item.productId },
                    data: { quantity: { increment: item.quantity } }
                });
            }
        }

        // 3. If CANCELLED, return stock to source
        if (status === 'CANCELLED') {
            for (const item of transfer.items) {
                await tx.stockAtLocation.update({
                    where: {
                        productId_locationId: {
                            productId: item.productId,
                            locationId: transfer.sourceLocationId
                        }
                    },
                    data: { quantity: { increment: item.quantity } }
                });

                await tx.product.update({
                    where: { id: item.productId },
                    data: { quantity: { increment: item.quantity } }
                });
            }
        }

        return updated;
    });

    return NextResponse.json({
        message: `Transfer marked as ${status}`,
        transfer: result
    });

  } catch (error: any) {
    console.error('TRANSFER_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
