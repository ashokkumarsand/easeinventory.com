import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import { PaymentMode, PaymentStatus, Prisma } from '@prisma/client';

interface RecordPaymentInput {
  poId: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string; // ISO date string
  referenceNumber?: string;
  notes?: string;
}

interface PayablesFilter {
  supplierId?: string;
  status?: PaymentStatus;
  search?: string;
}

interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}

export class SupplierPaymentService {
  /**
   * Record a payment against a purchase order
   */
  static async recordPayment(input: RecordPaymentInput, tenantId: string, userId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: input.poId, tenantId },
      include: { supplier: { select: { id: true, name: true } } },
    });

    if (!po) {
      throw new Error('Purchase order not found');
    }

    if (po.status === 'DRAFT' || po.status === 'CANCELLED') {
      throw new Error('Cannot record payment for a DRAFT or CANCELLED purchase order');
    }

    const outstanding = Number(po.total) - Number(po.paidAmount);
    if (input.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
    if (input.amount > outstanding) {
      throw new Error(`Payment amount (${input.amount}) exceeds outstanding balance (${outstanding.toFixed(2)})`);
    }

    const paymentNumber = await generateNumber('SPAY', tenantId);
    const newPaidAmount = Number(po.paidAmount) + input.amount;
    const isFullyPaid = Math.abs(newPaidAmount - Number(po.total)) < 0.01;

    // Determine new payment status
    let newPaymentStatus: PaymentStatus;
    if (isFullyPaid) {
      newPaymentStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newPaymentStatus = 'PARTIAL';
    } else {
      newPaymentStatus = 'PENDING';
    }

    // If overdue and not fully paid, keep OVERDUE
    if (!isFullyPaid && po.dueDate && new Date(po.dueDate) < new Date()) {
      newPaymentStatus = 'OVERDUE';
    }

    const [payment] = await prisma.$transaction([
      prisma.supplierPayment.create({
        data: {
          paymentNumber,
          poId: input.poId,
          supplierId: po.supplierId,
          amount: new Prisma.Decimal(input.amount),
          paymentMode: input.paymentMode,
          paymentDate: new Date(input.paymentDate),
          referenceNumber: input.referenceNumber || null,
          notes: input.notes || null,
          recordedById: userId,
          tenantId,
        },
      }),
      prisma.purchaseOrder.update({
        where: { id: input.poId },
        data: {
          paidAmount: new Prisma.Decimal(newPaidAmount),
          paymentStatus: newPaymentStatus,
        },
      }),
    ]);

    return payment;
  }

  /**
   * List POs with outstanding balances (payables)
   */
  static async getPayables(
    tenantId: string,
    filter: PayablesFilter = {},
    page = 1,
    pageSize = 20,
  ) {
    const where: Prisma.PurchaseOrderWhereInput = {
      tenantId,
      status: { notIn: ['DRAFT', 'CANCELLED'] },
    };

    if (filter.supplierId) {
      where.supplierId = filter.supplierId;
    }

    if (filter.status) {
      where.paymentStatus = filter.status;
    } else {
      // By default show only outstanding POs
      where.paymentStatus = { in: ['PENDING', 'PARTIAL', 'OVERDUE'] };
    }

    if (filter.search) {
      where.OR = [
        { poNumber: { contains: filter.search, mode: 'insensitive' } },
        { supplier: { name: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    const [payables, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        select: {
          id: true,
          poNumber: true,
          total: true,
          paidAmount: true,
          paymentStatus: true,
          dueDate: true,
          createdAt: true,
          supplier: { select: { id: true, name: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: payables.map((po) => ({
        ...po,
        total: Number(po.total),
        paidAmount: Number(po.paidAmount),
        outstanding: Number(po.total) - Number(po.paidAmount),
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Get payables aging analysis (5 buckets)
   */
  static async getPayablesAging(tenantId: string): Promise<AgingBucket[]> {
    const pos = await prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        status: { notIn: ['DRAFT', 'CANCELLED'] },
        paymentStatus: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      },
      select: {
        total: true,
        paidAmount: true,
        dueDate: true,
      },
    });

    const now = new Date();
    const buckets: AgingBucket[] = [
      { label: 'Current', amount: 0, count: 0 },
      { label: '1-30 Days', amount: 0, count: 0 },
      { label: '31-60 Days', amount: 0, count: 0 },
      { label: '61-90 Days', amount: 0, count: 0 },
      { label: '90+ Days', amount: 0, count: 0 },
    ];

    for (const po of pos) {
      const outstanding = Number(po.total) - Number(po.paidAmount);
      if (outstanding <= 0) continue;

      if (!po.dueDate || new Date(po.dueDate) >= now) {
        // Not yet due
        buckets[0].amount += outstanding;
        buckets[0].count++;
      } else {
        const daysPastDue = Math.floor(
          (now.getTime() - new Date(po.dueDate).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysPastDue <= 30) {
          buckets[1].amount += outstanding;
          buckets[1].count++;
        } else if (daysPastDue <= 60) {
          buckets[2].amount += outstanding;
          buckets[2].count++;
        } else if (daysPastDue <= 90) {
          buckets[3].amount += outstanding;
          buckets[3].count++;
        } else {
          buckets[4].amount += outstanding;
          buckets[4].count++;
        }
      }
    }

    return buckets.map((b) => ({ ...b, amount: Math.round(b.amount * 100) / 100 }));
  }

  /**
   * Get payables summary KPIs
   */
  static async getPayablesSummary(tenantId: string) {
    const [aging, paidLast30, allOutstanding] = await Promise.all([
      this.getPayablesAging(tenantId),
      // Payments recorded in last 30 days
      prisma.supplierPayment.aggregate({
        where: {
          tenantId,
          paymentDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { amount: true },
      }),
      // All fully/partially paid POs for avg days-to-pay
      prisma.purchaseOrder.findMany({
        where: {
          tenantId,
          status: { notIn: ['DRAFT', 'CANCELLED'] },
          paymentStatus: 'PAID',
          dueDate: { not: null },
        },
        select: {
          createdAt: true,
          updatedAt: true,
          dueDate: true,
        },
        take: 100,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const totalOutstanding = aging.reduce((sum, b) => sum + b.amount, 0);
    const totalOverdue = aging.slice(1).reduce((sum, b) => sum + b.amount, 0);

    // Compute avg days to pay from PO creation to last update (when status became PAID)
    let avgDaysToPay = 0;
    if (allOutstanding.length > 0) {
      const totalDays = allOutstanding.reduce((sum, po) => {
        const days = Math.floor(
          (po.updatedAt.getTime() - po.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        return sum + days;
      }, 0);
      avgDaysToPay = Math.round(totalDays / allOutstanding.length);
    }

    return {
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      totalOverdue: Math.round(totalOverdue * 100) / 100,
      paidLast30Days: Number(paidLast30._sum.amount || 0),
      avgDaysToPay,
      aging,
    };
  }

  /**
   * Get credit utilization per supplier
   */
  static async getSupplierCreditStatus(tenantId: string, supplierId?: string) {
    const where: Prisma.SupplierWhereInput = {
      tenantId,
      creditLimit: { not: null },
    };
    if (supplierId) where.id = supplierId;

    const suppliers = await prisma.supplier.findMany({
      where,
      select: {
        id: true,
        name: true,
        creditLimit: true,
        purchaseOrders: {
          where: {
            status: { notIn: ['DRAFT', 'CANCELLED'] },
            paymentStatus: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
          },
          select: { total: true, paidAmount: true },
        },
      },
    });

    return suppliers.map((s) => {
      const outstanding = s.purchaseOrders.reduce(
        (sum, po) => sum + (Number(po.total) - Number(po.paidAmount)),
        0,
      );
      const creditLimit = Number(s.creditLimit || 0);
      const utilization = creditLimit > 0 ? Math.round((outstanding / creditLimit) * 10000) / 100 : 0;

      return {
        supplierId: s.id,
        supplierName: s.name,
        creditLimit,
        outstanding: Math.round(outstanding * 100) / 100,
        utilization,
      };
    });
  }

  /**
   * Get payment history for a single PO
   */
  static async getPaymentsByPO(poId: string, tenantId: string) {
    return prisma.supplierPayment.findMany({
      where: { poId, tenantId },
      orderBy: { paymentDate: 'desc' },
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        paymentMode: true,
        paymentDate: true,
        referenceNumber: true,
        notes: true,
        createdAt: true,
      },
    });
  }
}
