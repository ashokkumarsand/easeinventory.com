import prisma from '@/lib/prisma';

/**
 * SLA Management Service
 *
 * Defines supplier SLA targets, tracks compliance, detects breaches,
 * and provides a compliance dashboard with penalty tracking.
 *
 * SLA definitions stored in Tenant.settings JSON under key "slaDefinitions"
 * keyed by supplierId.
 */

interface SlaDef {
  supplierId: string;
  supplierName: string;
  maxLeadTimeDays: number;
  minFillRatePct: number;
  maxDefectRatePct: number;
  penaltyPerBreachPct: number; // % of PO value
}

interface SlaBreachEvent {
  supplierId: string;
  supplierName: string;
  poId: string;
  poNumber: string;
  breachType: 'LEAD_TIME' | 'FILL_RATE' | 'QUALITY';
  target: number;
  actual: number;
  breachDate: string;
  penaltyAmount: number;
}

interface SlaComplianceRow {
  supplierId: string;
  supplierName: string;
  totalPOs: number;
  onTimePOs: number;
  onTimePct: number;
  avgLeadTimeDays: number;
  targetLeadTimeDays: number;
  avgFillRatePct: number;
  targetFillRatePct: number;
  totalBreaches: number;
  totalPenalty: number;
  complianceScore: number; // 0-100
  status: 'COMPLIANT' | 'AT_RISK' | 'BREACHED';
}

interface SlaDashboard {
  summary: {
    totalSuppliers: number;
    suppliersWithSla: number;
    compliantSuppliers: number;
    atRiskSuppliers: number;
    breachedSuppliers: number;
    totalBreaches: number;
    totalPenaltyValue: number;
  };
  compliance: SlaComplianceRow[];
  recentBreaches: SlaBreachEvent[];
}

const DEFAULT_SLA = {
  maxLeadTimeDays: 14,
  minFillRatePct: 90,
  maxDefectRatePct: 5,
  penaltyPerBreachPct: 2,
};

// Helper to read SLA definitions from Tenant.settings
async function readSlaDefinitions(tenantId: string): Promise<Record<string, any>> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });
  const settings = (tenant?.settings as any) || {};
  return settings.slaDefinitions || {};
}

// Helper to write SLA definitions to Tenant.settings
async function writeSlaDefinitions(tenantId: string, defs: Record<string, any>): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });
  const settings = (tenant?.settings as any) || {};
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: { ...settings, slaDefinitions: defs },
    },
  });
}

export class SlaService {
  /**
   * Get SLA definition for a supplier
   */
  static async getSlaDefinition(tenantId: string, supplierId: string): Promise<SlaDef | null> {
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenantId },
      select: { id: true, name: true },
    });
    if (!supplier) return null;

    const defs = await readSlaDefinitions(tenantId);
    const sla = defs[supplierId];
    if (!sla) return null;

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      maxLeadTimeDays: sla.maxLeadTimeDays ?? DEFAULT_SLA.maxLeadTimeDays,
      minFillRatePct: sla.minFillRatePct ?? DEFAULT_SLA.minFillRatePct,
      maxDefectRatePct: sla.maxDefectRatePct ?? DEFAULT_SLA.maxDefectRatePct,
      penaltyPerBreachPct: sla.penaltyPerBreachPct ?? DEFAULT_SLA.penaltyPerBreachPct,
    };
  }

  static async setSlaDefinition(
    tenantId: string,
    supplierId: string,
    sla: Omit<SlaDef, 'supplierId' | 'supplierName'>
  ): Promise<void> {
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenantId },
    });
    if (!supplier) throw new Error('Supplier not found');

    const defs = await readSlaDefinitions(tenantId);
    defs[supplierId] = sla;
    await writeSlaDefinitions(tenantId, defs);
  }

  /**
   * Dashboard: compliance across all suppliers with SLAs
   */
  static async getDashboard(tenantId: string, lookbackDays = 180): Promise<SlaDashboard> {
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

    // Get all suppliers
    const suppliers = await prisma.supplier.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });

    // Get SLA definitions from tenant settings
    const slaDefs = await readSlaDefinitions(tenantId);

    const suppliersWithSla = suppliers.filter((s) => slaDefs[s.id]);

    // Get completed POs for each supplier
    const pos = await prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        createdAt: { gte: lookbackDate },
        status: { in: ['RECEIVED', 'PARTIALLY_RECEIVED', 'CLOSED'] },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: true,
        goodsReceipts: {
          select: { createdAt: true, items: true },
        },
      },
    });

    const compliance: SlaComplianceRow[] = [];
    const recentBreaches: SlaBreachEvent[] = [];

    for (const supplier of suppliersWithSla) {
      const sla = slaDefs[supplier.id] || DEFAULT_SLA;
      const supplierPOs = pos.filter((po) => po.supplierId === supplier.id);

      if (supplierPOs.length === 0) {
        compliance.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          totalPOs: 0,
          onTimePOs: 0,
          onTimePct: 100,
          avgLeadTimeDays: 0,
          targetLeadTimeDays: sla.maxLeadTimeDays,
          avgFillRatePct: 100,
          targetFillRatePct: sla.minFillRatePct,
          totalBreaches: 0,
          totalPenalty: 0,
          complianceScore: 100,
          status: 'COMPLIANT',
        });
        continue;
      }

      let totalLeadDays = 0;
      let onTimePOs = 0;
      let totalFillRate = 0;
      let breachCount = 0;
      let totalPenalty = 0;

      for (const po of supplierPOs) {
        // Calculate lead time (PO created → first GRN)
        const firstGrn = po.goodsReceipts.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )[0];

        let leadTimeDays = sla.maxLeadTimeDays;
        if (firstGrn) {
          leadTimeDays = Math.ceil(
            (firstGrn.createdAt.getTime() - po.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
        totalLeadDays += leadTimeDays;

        const isOnTime = leadTimeDays <= sla.maxLeadTimeDays;
        if (isOnTime) onTimePOs++;

        // Calculate fill rate
        const orderedQty = po.items.reduce((s, i) => s + i.orderedQty, 0);
        const receivedQty = po.goodsReceipts.reduce(
          (s, grn) => s + grn.items.reduce((gs, gi) => gs + gi.receivedQty, 0),
          0
        );
        const fillRate = orderedQty > 0 ? (receivedQty / orderedQty) * 100 : 100;
        totalFillRate += fillRate;

        // Check for breaches
        const poValue = po.items.reduce((s, i) => s + Number(i.unitCost) * i.orderedQty, 0);

        if (!isOnTime) {
          breachCount++;
          const penalty = poValue * (sla.penaltyPerBreachPct / 100);
          totalPenalty += penalty;
          recentBreaches.push({
            supplierId: supplier.id,
            supplierName: supplier.name,
            poId: po.id,
            poNumber: po.poNumber,
            breachType: 'LEAD_TIME',
            target: sla.maxLeadTimeDays,
            actual: leadTimeDays,
            breachDate: (firstGrn?.createdAt || po.createdAt).toISOString(),
            penaltyAmount: Math.round(penalty),
          });
        }

        if (fillRate < sla.minFillRatePct) {
          breachCount++;
          const penalty = poValue * (sla.penaltyPerBreachPct / 100);
          totalPenalty += penalty;
          recentBreaches.push({
            supplierId: supplier.id,
            supplierName: supplier.name,
            poId: po.id,
            poNumber: po.poNumber,
            breachType: 'FILL_RATE',
            target: sla.minFillRatePct,
            actual: Math.round(fillRate),
            breachDate: po.createdAt.toISOString(),
            penaltyAmount: Math.round(penalty),
          });
        }
      }

      const avgLeadTime = totalLeadDays / supplierPOs.length;
      const avgFillRate = totalFillRate / supplierPOs.length;
      const onTimePct = (onTimePOs / supplierPOs.length) * 100;

      // Composite score: 40% on-time, 40% fill rate, 20% breach-free
      const breachFreePct = Math.max(0, 100 - (breachCount / supplierPOs.length) * 100);
      const score = Math.round(onTimePct * 0.4 + avgFillRate * 0.4 + breachFreePct * 0.2);

      let status: SlaComplianceRow['status'] = 'COMPLIANT';
      if (score < 60) status = 'BREACHED';
      else if (score < 80) status = 'AT_RISK';

      compliance.push({
        supplierId: supplier.id,
        supplierName: supplier.name,
        totalPOs: supplierPOs.length,
        onTimePOs,
        onTimePct: Math.round(onTimePct),
        avgLeadTimeDays: Math.round(avgLeadTime),
        targetLeadTimeDays: sla.maxLeadTimeDays,
        avgFillRatePct: Math.round(avgFillRate),
        targetFillRatePct: sla.minFillRatePct,
        totalBreaches: breachCount,
        totalPenalty: Math.round(totalPenalty),
        complianceScore: score,
        status,
      });
    }

    // Sort by compliance score ascending (worst first)
    compliance.sort((a, b) => a.complianceScore - b.complianceScore);
    recentBreaches.sort((a, b) => b.breachDate.localeCompare(a.breachDate));

    const compliantCount = compliance.filter((c) => c.status === 'COMPLIANT').length;
    const atRiskCount = compliance.filter((c) => c.status === 'AT_RISK').length;
    const breachedCount = compliance.filter((c) => c.status === 'BREACHED').length;

    return {
      summary: {
        totalSuppliers: suppliers.length,
        suppliersWithSla: suppliersWithSla.length,
        compliantSuppliers: compliantCount,
        atRiskSuppliers: atRiskCount,
        breachedSuppliers: breachedCount,
        totalBreaches: recentBreaches.length,
        totalPenaltyValue: compliance.reduce((s, c) => s + c.totalPenalty, 0),
      },
      compliance,
      recentBreaches: recentBreaches.slice(0, 20),
    };
  }
}
