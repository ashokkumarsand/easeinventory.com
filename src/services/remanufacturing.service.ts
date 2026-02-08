import prisma from '@/lib/prisma';

/**
 * Remanufacturing Service
 *
 * Manages disassembly of returned/used products, yield tracking,
 * and linkage between original SKUs and remanufactured output.
 * Uses existing BOM model for disassembly BOM and Tenant.settings
 * for remanufacturing orders (no new Prisma models).
 */

interface RemanOrder {
  id: string;
  sourceProductId: string;
  sourceProductName: string;
  outputProductId: string;
  outputProductName: string;
  bomId: string | null;
  status: 'PENDING' | 'DISASSEMBLY' | 'INSPECTION' | 'REASSEMBLY' | 'COMPLETED' | 'CANCELLED';
  inputQuantity: number;
  outputQuantity: number;
  yieldPct: number;
  scrapQuantity: number;
  notes: string;
  createdAt: string;
  completedAt: string | null;
}

interface RemanDashboard {
  summary: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    avgYieldPct: number;
    totalInputUnits: number;
    totalOutputUnits: number;
    totalScrap: number;
  };
  recentOrders: RemanOrder[];
  yieldByProduct: Array<{
    productId: string;
    productName: string;
    totalInput: number;
    totalOutput: number;
    avgYieldPct: number;
    ordersCount: number;
  }>;
}

function getRemanData(settings: any): { orders: RemanOrder[] } {
  return {
    orders: (settings?.remanufacturing?.orders as RemanOrder[]) || [],
  };
}

function generateId(): string {
  return 'RMN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
}

export class RemanufacturingService {
  static async getDashboard(tenantId: string): Promise<RemanDashboard> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const { orders } = getRemanData(tenant?.settings);

    const completed = orders.filter((o) => o.status === 'COMPLETED');
    const active = orders.filter((o) =>
      ['PENDING', 'DISASSEMBLY', 'INSPECTION', 'REASSEMBLY'].includes(o.status)
    );

    const totalInput = completed.reduce((s, o) => s + o.inputQuantity, 0);
    const totalOutput = completed.reduce((s, o) => s + o.outputQuantity, 0);
    const totalScrap = completed.reduce((s, o) => s + o.scrapQuantity, 0);
    const avgYield = completed.length > 0
      ? Math.round(completed.reduce((s, o) => s + o.yieldPct, 0) / completed.length)
      : 0;

    // Yield by product
    const yieldMap = new Map<string, { name: string; input: number; output: number; count: number }>();
    for (const o of completed) {
      const existing = yieldMap.get(o.sourceProductId) || { name: o.sourceProductName, input: 0, output: 0, count: 0 };
      existing.input += o.inputQuantity;
      existing.output += o.outputQuantity;
      existing.count++;
      yieldMap.set(o.sourceProductId, existing);
    }

    const yieldByProduct = Array.from(yieldMap.entries()).map(([productId, data]) => ({
      productId,
      productName: data.name,
      totalInput: data.input,
      totalOutput: data.output,
      avgYieldPct: data.input > 0 ? Math.round((data.output / data.input) * 100) : 0,
      ordersCount: data.count,
    }));

    return {
      summary: {
        totalOrders: orders.length,
        activeOrders: active.length,
        completedOrders: completed.length,
        avgYieldPct: avgYield,
        totalInputUnits: totalInput,
        totalOutputUnits: totalOutput,
        totalScrap,
      },
      recentOrders: orders.slice(-20).reverse(),
      yieldByProduct,
    };
  }

  static async createOrder(
    tenantId: string,
    input: {
      sourceProductId: string;
      outputProductId: string;
      bomId?: string;
      inputQuantity: number;
      notes?: string;
    }
  ): Promise<RemanOrder> {
    // Validate products exist
    const [sourceProduct, outputProduct] = await Promise.all([
      prisma.product.findFirst({ where: { id: input.sourceProductId, tenantId }, select: { name: true } }),
      prisma.product.findFirst({ where: { id: input.outputProductId, tenantId }, select: { name: true } }),
    ]);
    if (!sourceProduct) throw new Error('Source product not found');
    if (!outputProduct) throw new Error('Output product not found');

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as any) || {};
    const { orders } = getRemanData(settings);

    const order: RemanOrder = {
      id: generateId(),
      sourceProductId: input.sourceProductId,
      sourceProductName: sourceProduct.name,
      outputProductId: input.outputProductId,
      outputProductName: outputProduct.name,
      bomId: input.bomId || null,
      status: 'PENDING',
      inputQuantity: input.inputQuantity,
      outputQuantity: 0,
      yieldPct: 0,
      scrapQuantity: 0,
      notes: input.notes || '',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    orders.push(order);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          remanufacturing: { ...settings.remanufacturing, orders },
        },
      },
    });

    return order;
  }

  static async updateOrderStatus(
    tenantId: string,
    orderId: string,
    status: RemanOrder['status'],
    outputQuantity?: number,
    scrapQuantity?: number
  ): Promise<RemanOrder> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as any) || {};
    const { orders } = getRemanData(settings);

    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Remanufacturing order not found');

    order.status = status;
    if (outputQuantity !== undefined) order.outputQuantity = outputQuantity;
    if (scrapQuantity !== undefined) order.scrapQuantity = scrapQuantity;
    if (status === 'COMPLETED') {
      order.completedAt = new Date().toISOString();
      order.yieldPct = order.inputQuantity > 0
        ? Math.round((order.outputQuantity / order.inputQuantity) * 100)
        : 0;
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          remanufacturing: { ...settings.remanufacturing, orders },
        },
      },
    });

    return order;
  }
}
