import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export type ReportType =
  | 'INVENTORY_SUMMARY'
  | 'SALES_REPORT'
  | 'SUPPLIER_REPORT'
  | 'CUSTOMER_REPORT'
  | 'FINANCIAL_REPORT'
  | 'STOCK_MOVEMENT';

export type ReportFormat = 'CSV' | 'EXCEL';

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface CreateReportInput {
  name: string;
  reportType: ReportType;
  filtersJson?: Record<string, unknown>;
  columnsJson?: string[];
  format: ReportFormat;
  createdById: string;
  tenantId: string;
}

export interface UpdateReportInput {
  name?: string;
  filtersJson?: Record<string, unknown>;
  columnsJson?: string[];
  format?: ReportFormat;
}

export interface SetScheduleInput {
  scheduleFreq: ScheduleFrequency | null;
  scheduledEmails: string[];
}

export interface GeneratedReport {
  data: Record<string, unknown>[];
  columns: string[];
}

// ============================================================
// Column definitions per report type
// ============================================================

export const REPORT_COLUMNS: Record<ReportType, string[]> = {
  INVENTORY_SUMMARY: [
    'name',
    'sku',
    'category',
    'quantity',
    'costPrice',
    'salePrice',
    'totalValue',
    'reorderPoint',
    'abcClass',
  ],
  SALES_REPORT: [
    'orderNumber',
    'customerName',
    'date',
    'subtotal',
    'tax',
    'total',
    'status',
    'paymentStatus',
  ],
  SUPPLIER_REPORT: [
    'name',
    'contactPerson',
    'phone',
    'poCount',
    'totalPOValue',
    'avgLeadTime',
  ],
  CUSTOMER_REPORT: [
    'name',
    'email',
    'phone',
    'segment',
    'tier',
    'totalOrders',
    'lifetimeValue',
    'lastOrderDate',
  ],
  FINANCIAL_REPORT: [
    'invoiceNumber',
    'customerName',
    'date',
    'subtotal',
    'taxAmount',
    'total',
    'paymentStatus',
  ],
  STOCK_MOVEMENT: [
    'date',
    'productName',
    'type',
    'quantity',
    'notes',
    'userName',
  ],
};

// ============================================================
// Service
// ============================================================

export class ReportService {
  /**
   * List all saved reports for a tenant
   */
  static async list(tenantId: string) {
    return prisma.savedReport.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single report by ID
   */
  static async getById(id: string, tenantId: string) {
    return prisma.savedReport.findFirst({
      where: { id, tenantId },
    });
  }

  /**
   * Create a new saved report
   */
  static async create(data: CreateReportInput) {
    return prisma.savedReport.create({
      data: {
        name: data.name,
        reportType: data.reportType,
        filtersJson: data.filtersJson ? (data.filtersJson as Prisma.InputJsonValue) : undefined,
        columnsJson: data.columnsJson ? (data.columnsJson as Prisma.InputJsonValue) : undefined,
        format: data.format,
        createdById: data.createdById,
        tenantId: data.tenantId,
      },
    });
  }

  /**
   * Update a saved report
   */
  static async update(id: string, tenantId: string, data: UpdateReportInput) {
    // Verify ownership
    const existing = await prisma.savedReport.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new Error('Report not found');

    return prisma.savedReport.update({
      where: { id },
      data: {
        name: data.name,
        filtersJson: data.filtersJson ? (data.filtersJson as Prisma.InputJsonValue) : undefined,
        columnsJson: data.columnsJson ? (data.columnsJson as Prisma.InputJsonValue) : undefined,
        format: data.format,
      },
    });
  }

  /**
   * Delete a saved report
   */
  static async delete(id: string, tenantId: string) {
    const existing = await prisma.savedReport.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new Error('Report not found');

    return prisma.savedReport.delete({ where: { id } });
  }

  /**
   * Generate report data based on config
   */
  static async generate(id: string, tenantId: string): Promise<GeneratedReport> {
    const report = await prisma.savedReport.findFirst({
      where: { id, tenantId },
    });
    if (!report) throw new Error('Report not found');

    const selectedColumns = (report.columnsJson as string[] | null) ??
      REPORT_COLUMNS[report.reportType as ReportType];
    const filters = (report.filtersJson as Record<string, unknown> | null) ?? {};

    let data: Record<string, unknown>[] = [];

    switch (report.reportType) {
      case 'INVENTORY_SUMMARY':
        data = await ReportService.generateInventorySummary(tenantId, filters, selectedColumns);
        break;
      case 'SALES_REPORT':
        data = await ReportService.generateSalesReport(tenantId, filters, selectedColumns);
        break;
      case 'SUPPLIER_REPORT':
        data = await ReportService.generateSupplierReport(tenantId, filters, selectedColumns);
        break;
      case 'CUSTOMER_REPORT':
        data = await ReportService.generateCustomerReport(tenantId, filters, selectedColumns);
        break;
      case 'FINANCIAL_REPORT':
        data = await ReportService.generateFinancialReport(tenantId, filters, selectedColumns);
        break;
      case 'STOCK_MOVEMENT':
        data = await ReportService.generateStockMovement(tenantId, filters, selectedColumns);
        break;
    }

    // Update lastGeneratedAt
    await prisma.savedReport.update({
      where: { id },
      data: { lastGeneratedAt: new Date() },
    });

    return { data, columns: selectedColumns };
  }

  // ------ Report generators ------

  private static async generateInventorySummary(
    tenantId: string,
    filters: Record<string, unknown>,
    columns: string[],
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = { tenantId };
    if (filters.category) {
      where.category = { name: { contains: filters.category as string, mode: 'insensitive' } };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
      take: 5000,
    });

    return products.map((p) => {
      const row: Record<string, unknown> = {};
      if (columns.includes('name')) row.name = p.name;
      if (columns.includes('sku')) row.sku = p.sku ?? '';
      if (columns.includes('category')) row.category = p.category?.name ?? '';
      if (columns.includes('quantity')) row.quantity = p.quantity;
      if (columns.includes('costPrice')) row.costPrice = Number(p.costPrice);
      if (columns.includes('salePrice')) row.salePrice = Number(p.salePrice);
      if (columns.includes('totalValue')) row.totalValue = Number(p.costPrice) * p.quantity;
      if (columns.includes('reorderPoint')) row.reorderPoint = p.reorderPoint ?? p.minStock;
      if (columns.includes('abcClass')) row.abcClass = p.abcClass ?? '';
      return row;
    });
  }

  private static async generateSalesReport(
    tenantId: string,
    filters: Record<string, unknown>,
    columns: string[],
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = { tenantId };
    if (filters.status) {
      where.status = filters.status as string;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(filters.dateFrom as string);
      if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(filters.dateTo as string);
    }

    const orders = await prisma.salesOrder.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    return orders.map((o) => {
      const row: Record<string, unknown> = {};
      if (columns.includes('orderNumber')) row.orderNumber = o.orderNumber;
      if (columns.includes('customerName')) row.customerName = o.customer?.name ?? o.shippingName;
      if (columns.includes('date')) row.date = o.createdAt.toISOString().slice(0, 10);
      if (columns.includes('subtotal')) row.subtotal = Number(o.subtotal);
      if (columns.includes('tax')) row.tax = Number(o.taxAmount);
      if (columns.includes('total')) row.total = Number(o.total);
      if (columns.includes('status')) row.status = o.status;
      if (columns.includes('paymentStatus')) row.paymentStatus = o.paymentStatus;
      return row;
    });
  }

  private static async generateSupplierReport(
    tenantId: string,
    _filters: Record<string, unknown>,
    columns: string[],
  ): Promise<Record<string, unknown>[]> {
    const suppliers = await prisma.supplier.findMany({
      where: { tenantId },
      include: {
        purchaseOrders: {
          select: { id: true, total: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 5000,
    });

    return suppliers.map((s) => {
      const row: Record<string, unknown> = {};
      if (columns.includes('name')) row.name = s.name;
      if (columns.includes('contactPerson')) row.contactPerson = s.contactPerson ?? '';
      if (columns.includes('phone')) row.phone = s.phone ?? '';
      if (columns.includes('poCount')) row.poCount = s.purchaseOrders.length;
      if (columns.includes('totalPOValue')) {
        row.totalPOValue = s.purchaseOrders.reduce((sum, po) => sum + Number(po.total), 0);
      }
      if (columns.includes('avgLeadTime')) row.avgLeadTime = s.avgLeadTimeDays ?? '';
      return row;
    });
  }

  private static async generateCustomerReport(
    tenantId: string,
    filters: Record<string, unknown>,
    columns: string[],
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = { tenantId };
    if (filters.segment) {
      where.segment = filters.segment as string;
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 5000,
    });

    return customers.map((c) => {
      const row: Record<string, unknown> = {};
      if (columns.includes('name')) row.name = c.name;
      if (columns.includes('email')) row.email = c.email ?? '';
      if (columns.includes('phone')) row.phone = c.phone ?? '';
      if (columns.includes('segment')) row.segment = c.segment ?? '';
      if (columns.includes('tier')) row.tier = c.tier ?? '';
      if (columns.includes('totalOrders')) row.totalOrders = c.totalOrders;
      if (columns.includes('lifetimeValue')) row.lifetimeValue = Number(c.lifetimeValue);
      if (columns.includes('lastOrderDate')) {
        row.lastOrderDate = c.lastOrderDate ? c.lastOrderDate.toISOString().slice(0, 10) : '';
      }
      return row;
    });
  }

  private static async generateFinancialReport(
    tenantId: string,
    filters: Record<string, unknown>,
    columns: string[],
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = { tenantId };
    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus as string;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.invoiceDate = {};
      if (filters.dateFrom) (where.invoiceDate as Record<string, unknown>).gte = new Date(filters.dateFrom as string);
      if (filters.dateTo) (where.invoiceDate as Record<string, unknown>).lte = new Date(filters.dateTo as string);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { customer: true },
      orderBy: { invoiceDate: 'desc' },
      take: 5000,
    });

    return invoices.map((inv) => {
      const row: Record<string, unknown> = {};
      if (columns.includes('invoiceNumber')) row.invoiceNumber = inv.invoiceNumber;
      if (columns.includes('customerName')) row.customerName = inv.customer?.name ?? '';
      if (columns.includes('date')) row.date = inv.invoiceDate.toISOString().slice(0, 10);
      if (columns.includes('subtotal')) row.subtotal = Number(inv.subtotal);
      if (columns.includes('taxAmount')) row.taxAmount = Number(inv.taxAmount);
      if (columns.includes('total')) row.total = Number(inv.total);
      if (columns.includes('paymentStatus')) row.paymentStatus = inv.paymentStatus;
      return row;
    });
  }

  private static async generateStockMovement(
    tenantId: string,
    filters: Record<string, unknown>,
    columns: string[],
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = { tenantId };
    if (filters.type) {
      where.type = filters.type as string;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(filters.dateFrom as string);
      if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(filters.dateTo as string);
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    return movements.map((m) => {
      const row: Record<string, unknown> = {};
      if (columns.includes('date')) row.date = m.createdAt.toISOString().slice(0, 10);
      if (columns.includes('productName')) row.productName = m.product.name;
      if (columns.includes('type')) row.type = m.type;
      if (columns.includes('quantity')) row.quantity = m.quantity;
      if (columns.includes('notes')) row.notes = m.notes ?? '';
      if (columns.includes('userName')) row.userName = m.user.name ?? '';
      return row;
    });
  }

  // ------ Export helpers ------

  /**
   * Convert data rows to CSV string
   */
  static exportCSV(data: Record<string, unknown>[], columns: string[]): string {
    if (data.length === 0) return columns.join(',') + '\n';

    const header = columns.join(',');
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return '';
          const str = String(val);
          // Escape CSV values that contain commas, quotes, or newlines
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(','),
    );

    return [header, ...rows].join('\n') + '\n';
  }

  /**
   * Convert data rows to tab-separated Excel-compatible format
   */
  static exportExcel(data: Record<string, unknown>[], columns: string[]): Buffer {
    const header = columns.join('\t');
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return '';
          return String(val).replace(/\t/g, ' ');
        })
        .join('\t'),
    );

    const content = [header, ...rows].join('\n') + '\n';
    return Buffer.from(content, 'utf-8');
  }

  // ------ Scheduling ------

  /**
   * Set schedule frequency and email recipients for a report
   */
  static async setSchedule(id: string, tenantId: string, data: SetScheduleInput) {
    const existing = await prisma.savedReport.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new Error('Report not found');

    let nextRunAt: Date | null = null;
    if (data.scheduleFreq) {
      nextRunAt = ReportService.calculateNextRunAt(data.scheduleFreq);
    }

    return prisma.savedReport.update({
      where: { id },
      data: {
        scheduleFreq: data.scheduleFreq,
        scheduledEmails: data.scheduledEmails,
        nextRunAt,
      },
    });
  }

  /**
   * Evaluate scheduled reports: find any that are due and "generate" them
   */
  static async evaluateSchedules(tenantId: string) {
    const now = new Date();

    const dueReports = await prisma.savedReport.findMany({
      where: {
        tenantId,
        scheduleFreq: { not: null },
        nextRunAt: { lte: now },
      },
    });

    const results: { reportId: string; name: string; status: string }[] = [];

    for (const report of dueReports) {
      try {
        // Generate report data
        const { data, columns } = await ReportService.generate(report.id, tenantId);

        // In production, we would email the CSV/Excel here
        const emails = report.scheduledEmails;
        console.log(
          `[SCHEDULED REPORT] "${report.name}" generated for tenant ${tenantId}. ` +
          `${data.length} rows, format: ${report.format}. ` +
          `Would email to: ${emails.join(', ') || '(none)'}`,
        );

        // Calculate next run
        const nextRunAt = ReportService.calculateNextRunAt(
          report.scheduleFreq as ScheduleFrequency,
        );

        await prisma.savedReport.update({
          where: { id: report.id },
          data: { nextRunAt },
        });

        results.push({ reportId: report.id, name: report.name, status: 'sent' });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[SCHEDULED REPORT ERROR] "${report.name}":`, message);
        results.push({ reportId: report.id, name: report.name, status: `error: ${message}` });
      }
    }

    return results;
  }

  /**
   * Calculate the next scheduled run time based on frequency
   */
  private static calculateNextRunAt(freq: ScheduleFrequency): Date {
    const now = new Date();
    switch (freq) {
      case 'DAILY': {
        const next = new Date(now);
        next.setDate(next.getDate() + 1);
        next.setHours(6, 0, 0, 0); // 6 AM next day
        return next;
      }
      case 'WEEKLY': {
        const next = new Date(now);
        next.setDate(next.getDate() + 7);
        next.setHours(6, 0, 0, 0);
        return next;
      }
      case 'MONTHLY': {
        const next = new Date(now);
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(6, 0, 0, 0);
        return next;
      }
    }
  }
}
