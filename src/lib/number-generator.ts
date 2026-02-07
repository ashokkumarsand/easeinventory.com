import prisma from '@/lib/prisma';

type EntityType = 'SO' | 'SHP' | 'PK' | 'COD' | 'PO' | 'GRN' | 'RET' | 'WV' | 'INV' | 'TRF' | 'CC' | 'BOM' | 'ASM';

const MODEL_MAP: Record<EntityType, string> = {
  SO: 'salesOrder',
  SHP: 'shipment',
  PK: 'pickList',
  COD: 'cODRemittance',
  PO: 'purchaseOrder',
  GRN: 'goodsReceipt',
  RET: 'returnRequest',
  WV: 'wave',
  INV: 'invoice',
  TRF: 'stockTransfer',
  CC: 'cycleCount',
  BOM: 'billOfMaterial',
  ASM: 'assemblyOrder',
};

/**
 * Generates a sequential number in the format PREFIX-YYYY-XXXX
 * Scoped per tenant and per year for clean numbering.
 *
 * Examples: SO-2026-0001, SHP-2026-0042, PK-2026-0003
 */
export async function generateNumber(
  entityType: EntityType,
  tenantId: string,
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const yearEnd = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);

  const modelName = MODEL_MAP[entityType];
  if (!modelName) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }

  // Count existing records for this tenant this year
  const model = (prisma as any)[modelName];
  const count = await model.count({
    where: {
      tenantId,
      createdAt: {
        gte: yearStart,
        lt: yearEnd,
      },
    },
  });

  const sequence = (count + 1).toString().padStart(4, '0');
  return `${entityType}-${currentYear}-${sequence}`;
}
