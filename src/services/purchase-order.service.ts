import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import type { Prisma } from '@prisma/client';

export interface CreatePOInput {
  supplierId: string;
  deliveryLocationId?: string;
  paymentTerms?: string;
  dueDate?: string;
  notes?: string;
  internalNotes?: string;
  ewayBillNumber?: string;
  transporterName?: string;
  vehicleNumber?: string;
  items: CreatePOItemInput[];
}

export interface CreatePOItemInput {
  productId?: string;
  productName: string;
  sku?: string;
  hsnCode?: string;
  orderedQty: number;
  unitCost: number;
  taxRate?: number;
}

export interface POFilter {
  status?: string;
  supplierId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class PurchaseOrderService {
  /**
   * Create a new purchase order
   */
  static async create(input: CreatePOInput, tenantId: string, userId: string) {
    const poNumber = await generateNumber('PO', tenantId);

    const items = input.items.map((item) => {
      const lineSubtotal = item.orderedQty * item.unitCost;
      const taxRate = item.taxRate || 0;
      const taxAmount = (lineSubtotal * taxRate) / 100;
      const total = lineSubtotal + taxAmount;

      return {
        productId: item.productId || undefined,
        productName: item.productName,
        sku: item.sku,
        hsnCode: item.hsnCode,
        orderedQty: item.orderedQty,
        unitCost: item.unitCost,
        taxRate,
        total,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.orderedQty * Number(i.unitCost), 0);
    const taxAmount = items.reduce((sum, i) => {
      const lineSub = i.orderedQty * Number(i.unitCost);
      return sum + (lineSub * Number(i.taxRate)) / 100;
    }, 0);
    const total = subtotal + taxAmount;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: input.supplierId,
        deliveryLocationId: input.deliveryLocationId || undefined,
        subtotal,
        taxAmount,
        total,
        paymentTerms: input.paymentTerms,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        notes: input.notes,
        internalNotes: input.internalNotes,
        ewayBillNumber: input.ewayBillNumber,
        transporterName: input.transporterName,
        vehicleNumber: input.vehicleNumber,
        createdById: userId,
        tenantId,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        supplier: true,
        deliveryLocation: true,
      },
    });

    return po;
  }

  /**
   * Get PO by ID with all relations
   */
  static async getById(id: string, tenantId: string) {
    return prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: true } },
        supplier: true,
        deliveryLocation: true,
        goodsReceipts: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * List POs with filtering and pagination
   */
  static async list(
    tenantId: string,
    filter: POFilter = {},
    page = 1,
    pageSize = 50,
  ) {
    const where: Prisma.PurchaseOrderWhereInput = { tenantId };

    if (filter.status) where.status = filter.status as any;
    if (filter.supplierId) where.supplierId = filter.supplierId;
    if (filter.search) {
      where.OR = [
        { poNumber: { contains: filter.search, mode: 'insensitive' } },
        { supplier: { name: { contains: filter.search, mode: 'insensitive' } } },
        { notes: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = filter.dateFrom;
      if (filter.dateTo) where.createdAt.lte = filter.dateTo;
    }

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: true,
          deliveryLocation: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { purchaseOrders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Mark PO as sent to supplier
   */
  static async send(poId: string, tenantId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
    });
    if (!po) throw new Error('Purchase order not found');
    if (po.status !== 'DRAFT') throw new Error('Only draft POs can be sent');

    return prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'SENT' },
    });
  }

  /**
   * Cancel a PO
   */
  static async cancel(poId: string, tenantId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
      include: { goodsReceipts: true },
    });
    if (!po) throw new Error('Purchase order not found');
    if (['RECEIVED', 'CLOSED'].includes(po.status)) {
      throw new Error('Cannot cancel received/closed POs');
    }
    if (po.goodsReceipts.some((gr) => gr.status === 'COMPLETED')) {
      throw new Error('Cannot cancel PO with completed goods receipts');
    }

    return prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Close a fully received PO
   */
  static async close(poId: string, tenantId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
    });
    if (!po) throw new Error('Purchase order not found');
    if (!['RECEIVED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
      throw new Error('Only received POs can be closed');
    }

    return prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'CLOSED' },
    });
  }

  /**
   * Update PO details (draft only)
   */
  static async update(poId: string, tenantId: string, data: Partial<CreatePOInput>) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
    });
    if (!po) throw new Error('Purchase order not found');
    if (po.status !== 'DRAFT') throw new Error('Only draft POs can be edited');

    const updateData: any = {};
    if (data.supplierId) updateData.supplierId = data.supplierId;
    if (data.deliveryLocationId !== undefined) updateData.deliveryLocationId = data.deliveryLocationId || null;
    if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.ewayBillNumber !== undefined) updateData.ewayBillNumber = data.ewayBillNumber;
    if (data.transporterName !== undefined) updateData.transporterName = data.transporterName;
    if (data.vehicleNumber !== undefined) updateData.vehicleNumber = data.vehicleNumber;

    return prisma.purchaseOrder.update({
      where: { id: poId },
      data: updateData,
      include: { items: true, supplier: true },
    });
  }

  /**
   * Update PO receive status based on GRN items
   */
  static async updateReceiveStatus(poId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId },
      include: { items: true },
    });
    if (!po) return;

    const allReceived = po.items.every((item) => item.receivedQty >= item.orderedQty);
    const anyReceived = po.items.some((item) => item.receivedQty > 0);

    let newStatus: any = po.status;
    if (allReceived) {
      newStatus = 'RECEIVED';
    } else if (anyReceived) {
      newStatus = 'PARTIALLY_RECEIVED';
    }

    if (newStatus !== po.status) {
      await prisma.purchaseOrder.update({
        where: { id: poId },
        data: { status: newStatus },
      });
    }
  }
}
