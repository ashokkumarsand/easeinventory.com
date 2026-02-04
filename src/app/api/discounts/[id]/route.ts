import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityAction } from '@/lib/audit';

// GET /api/discounts/[id] - Get single discount
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const discount = await prisma.blanketDiscount.findFirst({
      where: { id, tenantId },
    });

    if (!discount) {
      return NextResponse.json({ message: 'Discount not found' }, { status: 404 });
    }

    return NextResponse.json({ discount });
  } catch (error) {
    console.error('Fetch discount error:', error);
    return NextResponse.json({ message: 'Failed to fetch discount' }, { status: 500 });
  }
}

// PATCH /api/discounts/[id] - Update discount
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if discount exists
    const existingDiscount = await prisma.blanketDiscount.findFirst({
      where: { id, tenantId },
    });

    if (!existingDiscount) {
      return NextResponse.json({ message: 'Discount not found' }, { status: 404 });
    }

    const {
      name,
      description,
      discountType,
      discountValue,
      scope,
      scopeId,
      minQuantity,
      minOrderValue,
      maxUsageCount,
      startDate,
      endDate,
      priority,
      isActive,
    } = body;

    // Validation
    if (discountType === 'PERCENTAGE' && discountValue !== undefined && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json({ message: 'Percentage discount must be between 0 and 100' }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (scope !== undefined) updateData.scope = scope;
    if (scopeId !== undefined) updateData.scopeId = scope === 'ALL' ? null : scopeId;
    if (minQuantity !== undefined) updateData.minQuantity = minQuantity;
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue;
    if (maxUsageCount !== undefined) updateData.maxUsageCount = maxUsageCount;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;

    const discount = await prisma.blanketDiscount.update({
      where: { id },
      data: updateData,
    });

    await logSecurityAction({
      tenantId,
      userId,
      action: 'DISCOUNT_UPDATED',
      resource: `BlanketDiscount:${id}`,
      details: { changes: Object.keys(updateData) },
    });

    return NextResponse.json({ discount });
  } catch (error) {
    console.error('Update discount error:', error);
    return NextResponse.json({ message: 'Failed to update discount' }, { status: 500 });
  }
}

// DELETE /api/discounts/[id] - Delete discount
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['OWNER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Check if discount exists
    const existingDiscount = await prisma.blanketDiscount.findFirst({
      where: { id, tenantId },
    });

    if (!existingDiscount) {
      return NextResponse.json({ message: 'Discount not found' }, { status: 404 });
    }

    await prisma.blanketDiscount.delete({
      where: { id },
    });

    await logSecurityAction({
      tenantId,
      userId,
      action: 'DISCOUNT_DELETED',
      resource: `BlanketDiscount:${id}`,
      details: { name: existingDiscount.name },
    });

    return NextResponse.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Delete discount error:', error);
    return NextResponse.json({ message: 'Failed to delete discount' }, { status: 500 });
  }
}
