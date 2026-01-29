import prisma from '@/lib/prisma';
import { BusinessType, PlanType, Prisma } from '@prisma/client';

export interface CreateTenantInput {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  businessType?: BusinessType;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateTenantInput {
  name?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  customDomain?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  settings?: Prisma.InputJsonValue;
}

export class TenantService {
  /**
   * Create a new tenant (business)
   */
  static async create(input: CreateTenantInput) {
    // Check if slug is already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: input.slug },
    });

    if (existingTenant) {
      throw new Error('This subdomain is already taken');
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        email: input.email,
        phone: input.phone,
        businessType: input.businessType || 'SHOP',
        gstNumber: input.gstNumber,
        address: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        plan: 'FREE',
      },
    });

    return tenant;
  }

  /**
   * Get tenant by slug (subdomain)
   */
  static async getBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
          },
        },
      },
    });

    return tenant;
  }

  /**
   * Get tenant by custom domain
   */
  static async getByDomain(domain: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { customDomain: domain },
    });

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  static async getById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    return tenant;
  }

  /**
   * Update tenant details
   */
  static async update(id: string, input: UpdateTenantInput) {
    // If updating custom domain, check if it's available
    if (input.customDomain) {
      const existingDomain = await prisma.tenant.findFirst({
        where: {
          customDomain: input.customDomain,
          NOT: { id },
        },
      });

      if (existingDomain) {
        throw new Error('This domain is already in use');
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: input,
    });

    return tenant;
  }

  /**
   * Update tenant plan
   */
  static async updatePlan(id: string, plan: PlanType, expiresAt?: Date) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        plan,
        planExpiresAt: expiresAt,
      },
    });

    return tenant;
  }

  /**
   * Check if slug is available
   */
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });

    return !tenant;
  }

  /**
   * Get tenant statistics
   */
  static async getStats(tenantId: string) {
    const [
      productCount,
      userCount,
      customerCount,
      activeRepairs,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.product.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId } }),
      prisma.customer.count({ where: { tenantId } }),
      prisma.repairTicket.count({
        where: {
          tenantId,
          status: { notIn: ['DELIVERED', 'CANCELLED'] },
        },
      }),
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          invoiceDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      products: productCount,
      users: userCount,
      customers: customerCount,
      activeRepairs,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
    };
  }

  /**
   * Deactivate a tenant
   */
  static async deactivate(id: string) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });

    return tenant;
  }

  /**
   * Activate a tenant
   */
  static async activate(id: string) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });

    return tenant;
  }
}

export default TenantService;
