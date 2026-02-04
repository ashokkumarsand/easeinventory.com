import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityAction, SecurityAction } from '@/lib/audit';

// GET /api/discounts - List all blanket discounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const scope = searchParams.get('scope');

    const where: any = { tenantId };

    if (activeOnly) {
      where.isActive = true;
      where.startDate = { lte: new Date() };
      where.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ];
    }

    if (scope) {
      where.scope = scope;
    }

    const discounts = await prisma.blanketDiscount.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Get categories for scope display
    const categoryIds = discounts
      .filter(d => d.scope === 'CATEGORY' && d.scopeId)
      .map(d => d.scopeId!);

    const categories = categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];

    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Get suppliers for scope display
    const supplierIds = discounts
      .filter(d => d.scope === 'SUPPLIER' && d.scopeId)
      .map(d => d.scopeId!);

    const suppliers = supplierIds.length > 0
      ? await prisma.supplier.findMany({
          where: { id: { in: supplierIds } },
          select: { id: true, name: true },
        })
      : [];

    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

    // Enrich discounts with scope names
    const enrichedDiscounts = discounts.map(d => ({
      ...d,
      scopeName: d.scope === 'CATEGORY' && d.scopeId
        ? categoryMap.get(d.scopeId)
        : d.scope === 'SUPPLIER' && d.scopeId
        ? supplierMap.get(d.scopeId)
        : d.scope === 'BRAND' ? d.scopeId
        : null,
    }));

    return NextResponse.json({ discounts: enrichedDiscounts });
  } catch (error) {
    console.error('Fetch discounts error:', error);
    return NextResponse.json({ message: 'Failed to fetch discounts' }, { status: 500 });
  }
}

// POST /api/discounts - Create new blanket discount
export async function POST(request: NextRequest) {
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

    // Only OWNER and MANAGER can create discounts
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
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
    if (!name || !discountValue || !startDate) {
      return NextResponse.json({ message: 'Name, discount value, and start date are required' }, { status: 400 });
    }

    if (discountType === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json({ message: 'Percentage discount must be between 0 and 100' }, { status: 400 });
    }

    // If scope is CATEGORY or SUPPLIER, verify scopeId exists
    if (scope === 'CATEGORY' && scopeId) {
      const category = await prisma.category.findFirst({
        where: { id: scopeId, tenantId },
      });
      if (!category) {
        return NextResponse.json({ message: 'Category not found' }, { status: 400 });
      }
    }

    if (scope === 'SUPPLIER' && scopeId) {
      const supplier = await prisma.supplier.findFirst({
        where: { id: scopeId, tenantId },
      });
      if (!supplier) {
        return NextResponse.json({ message: 'Supplier not found' }, { status: 400 });
      }
    }

    const discount = await prisma.blanketDiscount.create({
      data: {
        name,
        description,
        discountType: discountType || 'PERCENTAGE',
        discountValue,
        scope: scope || 'ALL',
        scopeId: scope === 'ALL' ? null : scopeId,
        minQuantity,
        minOrderValue,
        maxUsageCount,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        priority: priority || 0,
        isActive: isActive ?? true,
        tenantId,
        createdById: userId,
      },
    });

    // Log the action
    await logSecurityAction({
      tenantId,
      userId,
      action: 'DISCOUNT_CREATED',
      resource: `BlanketDiscount:${discount.id}`,
      details: { name, discountType, discountValue, scope },
    });

    return NextResponse.json({ discount }, { status: 201 });
  } catch (error) {
    console.error('Create discount error:', error);
    return NextResponse.json({ message: 'Failed to create discount' }, { status: 500 });
  }
}
