import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import { PurchaseOrderService } from './purchase-order.service';
import type { Prisma } from '@prisma/client';

export interface CreateGRNInput {
  poId?: string;
  supplierId: string;
  receivingLocationId?: string;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: string;
  notes?: string;
  items: CreateGRNItemInput[];
}

export interface CreateGRNItemInput {
  productId?: string;
  productName: string;
  expectedQty: number;
  unitCost: number;
  lotNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface GRNFilter {
  status?: string;
  supplierId?: string;
  poId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class GoodsReceiptService {
  /**
   * Create a new goods receipt note
   */
  static async create(input: CreateGRNInput, tenantId: string, userId: string) {
    const grnNumber = await generateNumber('GRN', tenantId);

    const grn = await prisma.goodsReceipt.create({
      data: {
        grnNumber,
        poId: input.poId || undefined,
        supplierId: input.supplierId,
        receivingLocationId: input.receivingLocationId || undefined,
        supplierInvoiceNumber: input.supplierInvoiceNumber,
        supplierInvoiceDate: input.supplierInvoiceDate ? new Date(input.supplierInvoiceDate) : undefined,
        notes: input.notes,
        receivedById: userId,
        tenantId,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId || undefined,
            productName: item.productName,
            expectedQty: item.expectedQty,
            unitCost: item.unitCost,
            lotNumber: item.lotNumber,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          })),
        },
      },
      include: {
        items: true,
        supplier: true,
        po: true,
        receivingLocation: true,
      },
    });

    return grn;
  }

  /**
   * Create GRN from a purchase order (pre-fills items from PO)
   */
  static async createFromPO(poId: string, tenantId: string, userId: string, receivingLocationId?: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
      include: { items: { include: { product: true } } },
    });
    if (!po) throw new Error('Purchase order not found');
    if (['CANCELLED', 'CLOSED', 'DRAFT'].includes(po.status)) {
      throw new Error('Cannot create GRN for this PO status');
    }

    const grnNumber = await generateNumber('GRN', tenantId);

    const grn = await prisma.goodsReceipt.create({
      data: {
        grnNumber,
        poId: po.id,
        supplierId: po.supplierId,
        receivingLocationId: receivingLocationId || po.deliveryLocationId || undefined,
        receivedById: userId,
        tenantId,
        items: {
          create: po.items
            .filter((item) => item.receivedQty < item.orderedQty)
            .map((item) => ({
              productId: item.productId || undefined,
              productName: item.productName,
              expectedQty: item.orderedQty - item.receivedQty,
              unitCost: Number(item.unitCost),
            })),
        },
      },
      include: {
        items: true,
        supplier: true,
        po: true,
        receivingLocation: true,
      },
    });

    return grn;
  }

  /**
   * Get GRN by ID with all relations
   */
  static async getById(id: string, tenantId: string) {
    return prisma.goodsReceipt.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: true } },
        supplier: true,
        po: { include: { items: true } },
        receivingLocation: true,
      },
    });
  }

  /**
   * List GRNs with filtering and pagination
   */
  static async list(
    tenantId: string,
    filter: GRNFilter = {},
    page = 1,
    pageSize = 50,
  ) {
    const where: Prisma.GoodsReceiptWhereInput = { tenantId };

    if (filter.status) where.status = filter.status as any;
    if (filter.supplierId) where.supplierId = filter.supplierId;
    if (filter.poId) where.poId = filter.poId;
    if (filter.search) {
      where.OR = [
        { grnNumber: { contains: filter.search, mode: 'insensitive' } },
        { supplier: { name: { contains: filter.search, mode: 'insensitive' } } },
        { supplierInvoiceNumber: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = filter.dateFrom;
      if (filter.dateTo) where.createdAt.lte = filter.dateTo;
    }

    const [goodsReceipts, total] = await Promise.all([
      prisma.goodsReceipt.findMany({
        where,
        include: {
          supplier: true,
          po: true,
          items: true,
          receivingLocation: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.goodsReceipt.count({ where }),
    ]);

    return { goodsReceipts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Update received quantities for a GRN item
   */
  static async updateItem(
    grnId: string,
    itemId: string,
    tenantId: string,
    receivedQty: number,
    rejectedQty?: number,
    rejectionReason?: string,
    lotNumber?: string,
    batchNumber?: string,
    expiryDate?: string,
    putawayLocationId?: string,
  ) {
    const grn = await prisma.goodsReceipt.findFirst({
      where: { id: grnId, tenantId },
      include: { items: true },
    });
    if (!grn) throw new Error('Goods receipt not found');
    if (grn.status === 'COMPLETED' || grn.status === 'CANCELLED') {
      throw new Error('Cannot update completed/cancelled GRN');
    }

    const item = grn.items.find((i) => i.id === itemId);
    if (!item) throw new Error('GRN item not found');

    // Update GRN status to IN_PROGRESS if still PENDING
    if (grn.status === 'PENDING') {
      await prisma.goodsReceipt.update({
        where: { id: grnId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return prisma.goodsReceiptItem.update({
      where: { id: itemId },
      data: {
        receivedQty,
        rejectedQty: rejectedQty || 0,
        rejectionReason,
        lotNumber,
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        putawayLocationId,
      },
    });
  }

  /**
   * Complete a GRN — update stock levels, create lots, update PO received quantities
   */
  static async complete(grnId: string, tenantId: string, qcStatus?: string) {
    const grn = await prisma.goodsReceipt.findFirst({
      where: { id: grnId, tenantId },
      include: { items: { include: { product: true } } },
    });
    if (!grn) throw new Error('Goods receipt not found');
    if (grn.status === 'COMPLETED') throw new Error('GRN already completed');
    if (grn.status === 'CANCELLED') throw new Error('Cannot complete cancelled GRN');

    await prisma.$transaction(async (tx) => {
      for (const item of grn.items) {
        if (item.receivedQty <= 0) continue;

        // Update product stock quantity
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.receivedQty },
            },
          });

          // Update stock at receiving location if specified
          if (grn.receivingLocationId) {
            const existing = await tx.stockAtLocation.findFirst({
              where: {
                productId: item.productId,
                locationId: grn.receivingLocationId,
              },
            });
            if (existing) {
              await tx.stockAtLocation.update({
                where: { id: existing.id },
                data: { quantity: { increment: item.receivedQty } },
              });
            } else {
              await tx.stockAtLocation.create({
                data: {
                  productId: item.productId!,
                  locationId: grn.receivingLocationId!,
                  quantity: item.receivedQty,
                },
              });
            }
          }

          // Create product lot if lot/batch info provided
          if (item.lotNumber || item.batchNumber) {
            await tx.productLot.create({
              data: {
                productId: item.productId!,
                lotNumber: item.lotNumber || `GRN-${grn.grnNumber}`,
                batchNumber: item.batchNumber,
                quantity: item.receivedQty,
                initialQuantity: item.receivedQty,
                expiryDate: item.expiryDate,
                costPrice: item.unitCost,
                tenantId,
              },
            });
          }
        }

        // Update PO item received quantities
        if (grn.poId && item.productId) {
          const poItem = await tx.purchaseOrderItem.findFirst({
            where: {
              poId: grn.poId,
              productId: item.productId,
            },
          });
          if (poItem) {
            await tx.purchaseOrderItem.update({
              where: { id: poItem.id },
              data: {
                receivedQty: { increment: item.receivedQty },
                rejectedQty: { increment: item.rejectedQty },
              },
            });
          }
        }
      }

      // Mark GRN as completed
      await tx.goodsReceipt.update({
        where: { id: grnId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          qcStatus: qcStatus || 'PASSED',
        },
      });
    });

    // Update PO receive status
    if (grn.poId) {
      await PurchaseOrderService.updateReceiveStatus(grn.poId);
    }

    return this.getById(grnId, tenantId);
  }

  /**
   * Cancel a GRN
   */
  static async cancel(grnId: string, tenantId: string) {
    const grn = await prisma.goodsReceipt.findFirst({
      where: { id: grnId, tenantId },
    });
    if (!grn) throw new Error('Goods receipt not found');
    if (grn.status === 'COMPLETED') throw new Error('Cannot cancel completed GRN');

    return prisma.goodsReceipt.update({
      where: { id: grnId },
      data: { status: 'CANCELLED' },
    });
  }
}
