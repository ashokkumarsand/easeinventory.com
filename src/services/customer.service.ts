import prisma from '@/lib/prisma';
import type { CustomerSegment, CustomerTier, Prisma } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export interface CustomerListOptions {
  segment?: CustomerSegment;
  tier?: CustomerTier;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface CustomerCreateInput {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  companyName?: string;
  gstNumber?: string;
  segment?: CustomerSegment;
  tier?: CustomerTier;
  tags?: string[];
  notes?: string;
  tenantId: string;
}

export interface CustomerUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  companyName?: string;
  gstNumber?: string;
  segment?: CustomerSegment;
  tier?: CustomerTier;
  tags?: string[];
  notes?: string;
}

export interface CustomerAnalytics {
  segmentDistribution: { segment: string; count: number }[];
  tierDistribution: { tier: string; count: number }[];
  topCustomers: {
    id: string;
    name: string;
    email: string | null;
    lifetimeValue: number;
    totalOrders: number;
    segment: string | null;
    tier: string | null;
  }[];
  atRiskCustomers: {
    id: string;
    name: string;
    email: string | null;
    lastOrderDate: Date | null;
    lifetimeValue: number;
    totalOrders: number;
  }[];
  avgCLV: number;
  totalCustomers: number;
}

// ============================================================
// Service
// ============================================================

export class CustomerService {
  /**
   * List customers with filters and pagination
   */
  static async list(tenantId: string, options: CustomerListOptions = {}) {
    const { segment, tier, search, tags, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = { tenantId };

    if (segment) {
      where.segment = segment;
    }

    if (tier) {
      where.tier = tier;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { salesOrders: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get customer by ID with order history (last 10 orders)
   */
  static async getById(id: string, tenantId: string) {
    return prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        salesOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
        _count: {
          select: { salesOrders: true, invoices: true, returnRequests: true },
        },
      },
    });
  }

  /**
   * Create a new customer
   */
  static async create(data: CustomerCreateInput) {
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        companyName: data.companyName,
        gstNumber: data.gstNumber,
        segment: data.segment || 'NEW',
        tier: data.tier || 'BRONZE',
        tags: data.tags || [],
        notes: data.notes,
        tenantId: data.tenantId,
      },
    });
  }

  /**
   * Update a customer
   */
  static async update(id: string, tenantId: string, data: CustomerUpdateInput) {
    // Verify customer belongs to tenant
    const existing = await prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new Error('Customer not found');

    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a customer
   */
  static async delete(id: string, tenantId: string) {
    const existing = await prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new Error('Customer not found');

    return prisma.customer.delete({
      where: { id },
    });
  }

  /**
   * Recalculate lifetime value, total orders, and last order date from salesOrders
   */
  static async updateMetrics(customerId: string, tenantId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) throw new Error('Customer not found');

    const aggregation = await prisma.salesOrder.aggregate({
      where: { customerId, tenantId },
      _sum: { total: true },
      _count: { id: true },
      _max: { createdAt: true },
    });

    return prisma.customer.update({
      where: { id: customerId },
      data: {
        lifetimeValue: aggregation._sum.total || 0,
        totalOrders: aggregation._count.id,
        lastOrderDate: aggregation._max.createdAt || null,
      },
    });
  }

  /**
   * RFM-based auto-segmentation for all customers of a tenant
   */
  static async segmentAll(tenantId: string) {
    // Step 1: Refresh metrics for all customers
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });

    // Batch update metrics
    for (const customer of customers) {
      const agg = await prisma.salesOrder.aggregate({
        where: { customerId: customer.id, tenantId },
        _sum: { total: true },
        _count: { id: true },
        _max: { createdAt: true },
      });
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          lifetimeValue: agg._sum.total || 0,
          totalOrders: agg._count.id,
          lastOrderDate: agg._max.createdAt || null,
        },
      });
    }

    // Step 2: Reload all customers with refreshed data
    const allCustomers = await prisma.customer.findMany({
      where: { tenantId },
      select: {
        id: true,
        lifetimeValue: true,
        totalOrders: true,
        lastOrderDate: true,
        createdAt: true,
      },
    });

    if (allCustomers.length === 0) return { segmented: 0 };

    const now = new Date();

    // Calculate monetary values and sort for percentile calculation
    const monetaryValues = allCustomers
      .map((c) => Number(c.lifetimeValue))
      .sort((a, b) => a - b);

    const frequencies = allCustomers
      .map((c) => c.totalOrders)
      .sort((a, b) => a - b);

    // Calculate thresholds
    const top10Idx = Math.floor(monetaryValues.length * 0.9);
    const top10MonetaryThreshold = monetaryValues[top10Idx] || 0;

    const medianIdx = Math.floor(frequencies.length / 2);
    const medianFrequency = frequencies[medianIdx] || 0;

    // Step 3: Assign segments
    let segmented = 0;
    for (const customer of allCustomers) {
      const monetary = Number(customer.lifetimeValue);
      const frequency = customer.totalOrders;
      const daysSinceLastOrder = customer.lastOrderDate
        ? Math.floor(
            (now.getTime() - customer.lastOrderDate.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : Infinity;
      const daysSinceCreated = Math.floor(
        (now.getTime() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      let segment: CustomerSegment;

      if (
        monetary >= top10MonetaryThreshold &&
        top10MonetaryThreshold > 0 &&
        frequency > medianFrequency
      ) {
        segment = 'VIP';
      } else if (frequency <= 1 && daysSinceCreated <= 30) {
        segment = 'NEW';
      } else if (daysSinceLastOrder > 180) {
        segment = 'CHURNED';
      } else if (daysSinceLastOrder > 90) {
        segment = 'AT_RISK';
      } else {
        segment = 'REGULAR';
      }

      await prisma.customer.update({
        where: { id: customer.id },
        data: { segment },
      });
      segmented++;
    }

    return { segmented };
  }

  /**
   * Get analytics: segment distribution, tier distribution, top customers, at-risk, avgCLV
   */
  static async getAnalytics(tenantId: string): Promise<CustomerAnalytics> {
    const [
      segmentGroups,
      tierGroups,
      topCustomers,
      atRiskCustomers,
      clvAgg,
      totalCustomers,
    ] = await Promise.all([
      // Segment distribution
      prisma.customer.groupBy({
        by: ['segment'],
        where: { tenantId },
        _count: { id: true },
      }),
      // Tier distribution
      prisma.customer.groupBy({
        by: ['tier'],
        where: { tenantId },
        _count: { id: true },
      }),
      // Top 10 by lifetime value
      prisma.customer.findMany({
        where: { tenantId },
        orderBy: { lifetimeValue: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          lifetimeValue: true,
          totalOrders: true,
          segment: true,
          tier: true,
        },
      }),
      // At-risk customers
      prisma.customer.findMany({
        where: { tenantId, segment: 'AT_RISK' },
        orderBy: { lastOrderDate: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          lastOrderDate: true,
          lifetimeValue: true,
          totalOrders: true,
        },
      }),
      // Average CLV
      prisma.customer.aggregate({
        where: { tenantId },
        _avg: { lifetimeValue: true },
      }),
      // Total count
      prisma.customer.count({ where: { tenantId } }),
    ]);

    return {
      segmentDistribution: segmentGroups.map((g) => ({
        segment: g.segment || 'UNKNOWN',
        count: g._count.id,
      })),
      tierDistribution: tierGroups.map((g) => ({
        tier: g.tier || 'UNKNOWN',
        count: g._count.id,
      })),
      topCustomers: topCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        lifetimeValue: Number(c.lifetimeValue),
        totalOrders: c.totalOrders,
        segment: c.segment,
        tier: c.tier,
      })),
      atRiskCustomers: atRiskCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        lastOrderDate: c.lastOrderDate,
        lifetimeValue: Number(c.lifetimeValue),
        totalOrders: c.totalOrders,
      })),
      avgCLV: Number(clvAgg._avg.lifetimeValue || 0),
      totalCustomers,
    };
  }
}
