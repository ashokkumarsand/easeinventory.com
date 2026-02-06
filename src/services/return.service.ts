import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import type { Prisma } from '@prisma/client';

export interface CreateReturnInput {
  orderId: string;
  customerId?: string;
  type: 'CUSTOMER_RETURN' | 'RTO' | 'EXCHANGE';
  reason: string;
  notes?: string;
  items: { productId?: string; productName: string; quantity: number }[];
}

export interface ReturnFilter {
  status?: string;
  type?: string;
  orderId?: string;
  search?: string;
}

export class ReturnService {
  static async create(input: CreateReturnInput, tenantId: string, userId: string) {
    const returnNumber = await generateNumber('RET', tenantId);

    // Validate order exists
    const order = await prisma.salesOrder.findFirst({
      where: { id: input.orderId, tenantId },
    });
    if (!order) throw new Error('Order not found');

    return prisma.returnRequest.create({
      data: {
        returnNumber,
        orderId: input.orderId,
        customerId: input.customerId || order.customerId || undefined,
        type: input.type,
        reason: input.reason,
        notes: input.notes,
        createdById: userId,
        tenantId,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId || undefined,
            productName: item.productName,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true, order: true, customer: true },
    });
  }

  static async getById(id: string, tenantId: string) {
    return prisma.returnRequest.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: true } },
        order: { include: { items: true } },
        customer: true,
      },
    });
  }

  static async list(tenantId: string, filter: ReturnFilter = {}, page = 1, pageSize = 50) {
    const where: Prisma.ReturnRequestWhereInput = { tenantId };

    if (filter.status) where.status = filter.status as any;
    if (filter.type) where.type = filter.type as any;
    if (filter.orderId) where.orderId = filter.orderId;
    if (filter.search) {
      where.OR = [
        { returnNumber: { contains: filter.search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: filter.search, mode: 'insensitive' } } },
        { reason: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          order: { select: { orderNumber: true, shippingName: true } },
          customer: { select: { name: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return { returns, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async approve(id: string, tenantId: string) {
    const ret = await prisma.returnRequest.findFirst({ where: { id, tenantId } });
    if (!ret) throw new Error('Return not found');
    if (ret.status !== 'REQUESTED') throw new Error('Only requested returns can be approved');

    return prisma.returnRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  static async inspect(
    id: string,
    tenantId: string,
    userId: string,
    items: { itemId: string; conditionGrade: string }[],
    inspectionNotes?: string,
  ) {
    const ret = await prisma.returnRequest.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!ret) throw new Error('Return not found');
    if (!['APPROVED', 'RECEIVED', 'INSPECTING'].includes(ret.status)) {
      throw new Error('Return must be received before inspection');
    }

    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.returnRequestItem.update({
          where: { id: item.itemId },
          data: { conditionGrade: item.conditionGrade },
        });
      }

      return tx.returnRequest.update({
        where: { id },
        data: {
          status: 'INSPECTED',
          inspectedAt: new Date(),
          inspectedBy: userId,
          inspectionNotes,
        },
        include: { items: true },
      });
    });
  }

  static async initiateRefund(
    id: string,
    tenantId: string,
    refundAmount: number,
    refundMode: string,
    restockApproved: boolean,
  ) {
    const ret = await prisma.returnRequest.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } } },
    });
    if (!ret) throw new Error('Return not found');
    if (ret.status !== 'INSPECTED') throw new Error('Return must be inspected before refund');

    return prisma.$transaction(async (tx) => {
      // Restock A-grade items if approved
      if (restockApproved) {
        for (const item of ret.items) {
          if (item.conditionGrade === 'A' && item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { quantity: { increment: item.quantity } },
            });
            await tx.returnRequestItem.update({
              where: { id: item.id },
              data: { restocked: true, restockedAt: new Date() },
            });
          }
        }
      }

      return tx.returnRequest.update({
        where: { id },
        data: {
          status: 'REFUND_INITIATED',
          refundAmount,
          refundMode,
          restockApproved,
          refundedAt: new Date(),
        },
        include: { items: true },
      });
    });
  }

  static async close(id: string, tenantId: string) {
    const ret = await prisma.returnRequest.findFirst({ where: { id, tenantId } });
    if (!ret) throw new Error('Return not found');

    return prisma.returnRequest.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  static async reject(id: string, tenantId: string, reason: string) {
    const ret = await prisma.returnRequest.findFirst({ where: { id, tenantId } });
    if (!ret) throw new Error('Return not found');
    if (ret.status !== 'REQUESTED') throw new Error('Only requested returns can be rejected');

    return prisma.returnRequest.update({
      where: { id },
      data: { status: 'REJECTED', notes: reason },
    });
  }
}
