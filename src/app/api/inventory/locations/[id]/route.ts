import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get single location details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { id } = await params;

    const location = await prisma.location.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { stock: true, transfersFrom: true, transfersTo: true }
        },
        stock: {
          include: { product: true },
          take: 10
        }
      }
    });

    if (!location) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ location });

  } catch (error: any) {
    console.error('LOCATION_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// PATCH - Update location (status, details)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;
    
    // Only owners/managers can modify locations
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, code, address, city, type, isActive } = body;

    // Verify location exists and belongs to tenant
    const existing = await prisma.location.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { stock: true } }
      }
    });

    if (!existing) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(type !== undefined && { type }),
      }
    });

    return NextResponse.json({
      message: 'Location updated successfully',
      location
    });

  } catch (error: any) {
    console.error('LOCATION_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Delete location (only if empty)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;
    
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can delete locations' }, { status: 403 });
    }

    const { id } = await params;

    // Check if location has stock
    const location = await prisma.location.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { stock: true } },
        stock: { where: { quantity: { gt: 0 } }, take: 1 }
      }
    });

    if (!location) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    if (location.stock.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete location with existing stock. Transfer or remove all items first.' },
        { status: 400 }
      );
    }

    // Check for pending transfers
    const pendingTransfers = await prisma.stockTransfer.count({
      where: {
        OR: [
          { sourceLocationId: id },
          { destLocationId: id }
        ],
        status: { in: ['PENDING', 'IN_TRANSIT'] }
      }
    });

    if (pendingTransfers > 0) {
      return NextResponse.json(
        { message: 'Cannot delete location with pending transfers' },
        { status: 400 }
      );
    }

    await prisma.location.delete({ where: { id } });

    return NextResponse.json({ message: 'Location deleted successfully' });

  } catch (error: any) {
    console.error('LOCATION_DELETE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
