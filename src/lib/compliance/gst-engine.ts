import prisma from '@/lib/prisma';

export interface GSTReportSummary {
  month: string;
  totalB2B: number;
  totalB2C: number;
  totalTax: number;
  totalAmount: number;
  invoiceCount: number;
}

export class GSTEngine {
  /**
   * Aggregates sales data for a specific period (GSTR-1 format)
   */
  static async getSalesSummary(tenantId: string, startDate: Date, endDate: Date): Promise<GSTReportSummary> {
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PAID', // Only consider paid/finalized invoices for returns
      },
      include: {
        customer: true,
      }
    });

    let totalB2B = 0;
    let totalB2C = 0;
    let totalTax = 0;
    let totalAmount = 0;

    invoices.forEach(inv => {
      const amount = Number(inv.total);
      const tax = Number(inv.taxAmount);
      
      totalAmount += amount;
      totalTax += tax;

      if (inv.customer?.gstNumber) {
        totalB2B += amount;
      } else {
        totalB2C += amount;
      }
    });

    return {
      month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalB2B,
      totalB2C,
      totalTax,
      totalAmount,
      invoiceCount: invoices.length,
    };
  }

  /**
   * Generates GSTR-1 compatible JSON data
   */
  static async generateGSTR1(tenantId: string, startDate: Date, endDate: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        invoiceDate: { gte: startDate, lte: endDate },
        status: { not: 'DRAFT' }
      },
      include: {
        customer: true,
        items: true,
      }
    });

    // Grouping by B2B and B2CS as per GST portal requirements
    const b2b = invoices.filter(inv => !!inv.customer?.gstNumber).map(inv => ({
      ctin: inv.customer?.gstNumber,
      inv: [{
        inum: inv.invoiceNumber,
        idt: inv.invoiceDate.toISOString().split('T')[0],
        val: Number(inv.total),
        pos: inv.customer?.state || '00', // Default POS
        rchrg: 'N',
        inv_typ: 'R',
        itms: inv.items.map(item => ({
          num: 1,
          itm_det: {
            txval: Number(item.total) - Number(item.taxAmount),
            rt: Number(item.taxRate),
            iamt: Number(item.taxAmount), // Simplified to IGST for mock
            csamt: 0
          }
        }))
      }]
    }));

    return {
      gstin: 'TENANT_GSTIN_PLACEHOLDER',
      fp: startDate.getMonth() + 1 + '' + startDate.getFullYear(),
      cur_gt: 0,
      gt: 0,
      b2b
    };
  }
}
