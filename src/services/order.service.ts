import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import type { Prisma } from '@prisma/client';

export interface CreateOrderInput {
  customerId?: string;
  shippingName: string;
  shippingPhone: string;
  shippingEmail?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  billingName?: string;
  billingPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPincode?: string;
  paymentMode?: string;
  isCOD?: boolean;
  sourceLocationId?: string;
  channel?: string;
  notes?: string;
  weightGrams?: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
  items: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
  productId?: string;
  productName: string;
  sku?: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export interface OrderFilter {
  status?: string;
  fulfillmentStatus?: string;
  search?: string;
  customerId?: string;
  isCOD?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export class OrderService {
  /**
   * Create a new sales order
   */
  static async create(input: CreateOrderInput, tenantId: string, userId: string) {
    const orderNumber = await generateNumber('SO', tenantId);

    // Calculate line totals
    const items = input.items.map((item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineDiscount = item.discount || 0;
      const taxableAmount = lineSubtotal - lineDiscount;
      const taxRate = item.taxRate || 0;
      const taxAmount = (taxableAmount * taxRate) / 100;
      const total = taxableAmount + taxAmount;

      return {
        productId: item.productId || undefined,
        productName: item.productName,
        sku: item.sku,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: lineDiscount,
        taxRate,
        taxAmount,
        total,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.quantity * Number(i.unitPrice), 0);
    const totalDiscount = items.reduce((sum, i) => sum + Number(i.discount), 0);
    const totalTax = items.reduce((sum, i) => sum + Number(i.taxAmount), 0);
    const total = items.reduce((sum, i) => sum + Number(i.total), 0);

    const order = await prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId: input.customerId || undefined,
        shippingName: input.shippingName,
        shippingPhone: input.shippingPhone,
        shippingEmail: input.shippingEmail,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingState: input.shippingState,
        shippingPincode: input.shippingPincode,
        billingName: input.billingName,
        billingPhone: input.billingPhone,
        billingAddress: input.billingAddress,
        billingCity: input.billingCity,
        billingState: input.billingState,
        billingPincode: input.billingPincode,
        subtotal,
        discount: totalDiscount,
        taxAmount: totalTax,
        total,
        paymentMode: input.paymentMode as any,
        isCOD: input.isCOD || false,
        codAmount: input.isCOD ? total : undefined,
        sourceLocationId: input.sourceLocationId || undefined,
        channel: input.channel || 'MANUAL',
        notes: input.notes,
        weightGrams: input.weightGrams,
        lengthCm: input.lengthCm,
        breadthCm: input.breadthCm,
        heightCm: input.heightCm,
        createdById: userId,
        tenantId,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return order;
  }

  /**
   * Get order by ID with all relations
   */
  static async getById(id: string, tenantId: string) {
    return prisma.salesOrder.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: true } },
        customer: true,
        pickLists: { include: { items: true, assignedTo: true } },
        shipments: { include: { trackingEvents: { orderBy: { eventAt: 'desc' } } } },
        sourceLocation: true,
        invoice: true,
      },
    });
  }

  /**
   * List orders with filtering and pagination
   */
  static async list(
    tenantId: string,
    filter: OrderFilter = {},
    page = 1,
    pageSize = 50,
  ) {
    const where: Prisma.SalesOrderWhereInput = { tenantId };

    if (filter.status) where.status = filter.status as any;
    if (filter.fulfillmentStatus) where.fulfillmentStatus = filter.fulfillmentStatus as any;
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.isCOD !== undefined) where.isCOD = filter.isCOD;
    if (filter.search) {
      where.OR = [
        { orderNumber: { contains: filter.search, mode: 'insensitive' } },
        { shippingName: { contains: filter.search, mode: 'insensitive' } },
        { shippingPhone: { contains: filter.search } },
      ];
    }
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = filter.dateFrom;
      if (filter.dateTo) where.createdAt.lte = filter.dateTo;
    }

    const [orders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          items: true,
          shipments: { select: { id: true, awbNumber: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Confirm a draft order
   */
  static async confirm(orderId: string, tenantId: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new Error('Order not found');
    if (order.status !== 'DRAFT') throw new Error('Only draft orders can be confirmed');

    return prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });
  }

  /**
   * Cancel an order (only DRAFT or CONFIRMED)
   */
  static async cancel(orderId: string, tenantId: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId, tenantId },
      include: { shipments: true },
    });
    if (!order) throw new Error('Order not found');
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      throw new Error('Cannot cancel shipped/delivered orders');
    }
    if (order.shipments.some((s) => !['CREATED', 'CANCELLED'].includes(s.status))) {
      throw new Error('Cannot cancel order with active shipments');
    }

    return prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Generate pick list for an order
   */
  static async generatePickList(orderId: string, tenantId: string, locationId: string, assignedToId?: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });
    if (!order) throw new Error('Order not found');
    if (!['CONFIRMED', 'PROCESSING'].includes(order.status)) {
      throw new Error('Order must be confirmed before picking');
    }

    const pickNumber = await generateNumber('PK', tenantId);

    const pickList = await prisma.$transaction(async (tx) => {
      // Create pick list
      const pl = await tx.pickList.create({
        data: {
          pickNumber,
          orderId,
          locationId,
          assignedToId: assignedToId || undefined,
          tenantId,
          items: {
            create: order.items.map((item) => ({
              productId: item.productId!,
              requiredQty: item.quantity - item.pickedQty,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Update order status to PROCESSING
      await tx.salesOrder.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      });

      return pl;
    });

    return pickList;
  }

  /**
   * Update pick list item (mark as picked)
   */
  static async updatePickListItem(
    pickListId: string,
    itemId: string,
    tenantId: string,
    pickedQty: number,
    scannedBarcode?: string,
  ) {
    const pickList = await prisma.pickList.findFirst({
      where: { id: pickListId, tenantId },
      include: { items: true },
    });
    if (!pickList) throw new Error('Pick list not found');

    const item = pickList.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Pick list item not found');

    return prisma.$transaction(async (tx) => {
      // Update pick list item
      await tx.pickListItem.update({
        where: { id: itemId },
        data: {
          pickedQty,
          scannedBarcode,
          verifiedAt: new Date(),
        },
      });

      // Update corresponding sales order item picked qty
      const orderItem = await tx.salesOrderItem.findFirst({
        where: {
          orderId: pickList.orderId,
          productId: item.productId,
        },
      });
      if (orderItem) {
        await tx.salesOrderItem.update({
          where: { id: orderItem.id },
          data: { pickedQty: { increment: pickedQty } },
        });
      }

      // Check if all items are picked
      const updatedItems = await tx.pickListItem.findMany({
        where: { pickListId },
      });
      const allPicked = updatedItems.every((i) => i.pickedQty >= i.requiredQty);

      if (allPicked) {
        await tx.pickList.update({
          where: { id: pickListId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
      }

      return { allPicked };
    });
  }

  /**
   * Mark order as packed
   */
  static async markPacked(orderId: string, tenantId: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });
    if (!order) throw new Error('Order not found');

    return prisma.$transaction(async (tx) => {
      // Update all items packed qty = picked qty
      for (const item of order.items) {
        await tx.salesOrderItem.update({
          where: { id: item.id },
          data: { packedQty: item.pickedQty },
        });
      }

      return tx.salesOrder.findFirst({
        where: { id: orderId },
        include: { items: true },
      });
    });
  }

  /**
   * Update order details
   */
  static async update(orderId: string, tenantId: string, data: Partial<CreateOrderInput>) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new Error('Order not found');
    if (order.status !== 'DRAFT') throw new Error('Only draft orders can be edited');

    const updateData: any = {};
    if (data.shippingName) updateData.shippingName = data.shippingName;
    if (data.shippingPhone) updateData.shippingPhone = data.shippingPhone;
    if (data.shippingEmail !== undefined) updateData.shippingEmail = data.shippingEmail;
    if (data.shippingAddress) updateData.shippingAddress = data.shippingAddress;
    if (data.shippingCity) updateData.shippingCity = data.shippingCity;
    if (data.shippingState) updateData.shippingState = data.shippingState;
    if (data.shippingPincode) updateData.shippingPincode = data.shippingPincode;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.weightGrams) updateData.weightGrams = data.weightGrams;
    if (data.lengthCm) updateData.lengthCm = data.lengthCm;
    if (data.breadthCm) updateData.breadthCm = data.breadthCm;
    if (data.heightCm) updateData.heightCm = data.heightCm;
    if (data.sourceLocationId) updateData.sourceLocationId = data.sourceLocationId;

    return prisma.salesOrder.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true, customer: true },
    });
  }
}
