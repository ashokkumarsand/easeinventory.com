import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export interface RefurbishmentItem {
  id: string;
  returnNumber: string;
  productId: string | null;
  productName: string;
  quantity: number;
  conditionGrade: string | null;
  refurbishmentStatus: string | null;
  refurbishmentNotes: string | null;
  refurbishmentCost: number | null;
  conditionPrice: number | null;
  refurbishedAt: string | null;
  restocked: boolean;
  createdAt: string;
}

export interface RefurbishmentSummary {
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  scrappedCount: number;
  totalRefurbCost: number;
  totalConditionValue: number;
  gradeBreakdown: Record<string, number>;
}

export interface GradeInput {
  itemId: string;
  conditionGrade: string; // A, B, C, SCRAP
  conditionPrice?: number;
  refurbishmentNotes?: string;
}

// ============================================================
// Service
// ============================================================

export class RefurbishmentService {
  /**
   * Grade a return item and set refurbishment status
   */
  static async gradeItem(tenantId: string, input: GradeInput) {
    // Verify item belongs to tenant
    const item = await prisma.returnRequestItem.findFirst({
      where: { id: input.itemId, return: { tenantId } },
    });
    if (!item) throw new Error('Return item not found');

    // Set refurbishment status based on grade
    let refurbishmentStatus: string | undefined;
    if (input.conditionGrade === 'A') {
      refurbishmentStatus = undefined; // Grade A = resell as-is, no refurbishment
    } else if (input.conditionGrade === 'SCRAP') {
      refurbishmentStatus = 'SCRAPPED';
    } else {
      refurbishmentStatus = 'PENDING'; // B or C needs refurbishment
    }

    return prisma.returnRequestItem.update({
      where: { id: input.itemId },
      data: {
        conditionGrade: input.conditionGrade,
        conditionPrice: input.conditionPrice,
        refurbishmentNotes: input.refurbishmentNotes,
        refurbishmentStatus: refurbishmentStatus as any,
      },
    });
  }

  /**
   * Update refurbishment status (start, complete, scrap)
   */
  static async updateStatus(
    tenantId: string,
    itemId: string,
    status: string,
    cost?: number,
    notes?: string,
  ) {
    const item = await prisma.returnRequestItem.findFirst({
      where: { id: itemId, return: { tenantId } },
    });
    if (!item) throw new Error('Return item not found');

    const data: any = { refurbishmentStatus: status };
    if (cost !== undefined) data.refurbishmentCost = cost;
    if (notes !== undefined) data.refurbishmentNotes = notes;
    if (status === 'COMPLETED') data.refurbishedAt = new Date();

    return prisma.returnRequestItem.update({ where: { id: itemId }, data });
  }

  /**
   * Get the refurbishment queue — items needing attention
   */
  static async getQueue(tenantId: string): Promise<{
    summary: RefurbishmentSummary;
    items: RefurbishmentItem[];
  }> {
    const items = await prisma.returnRequestItem.findMany({
      where: {
        return: { tenantId },
        conditionGrade: { not: null },
      },
      include: {
        return: { select: { returnNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped: RefurbishmentItem[] = items.map((i) => ({
      id: i.id,
      returnNumber: i.return.returnNumber,
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      conditionGrade: i.conditionGrade,
      refurbishmentStatus: i.refurbishmentStatus,
      refurbishmentNotes: i.refurbishmentNotes,
      refurbishmentCost: i.refurbishmentCost ? Number(i.refurbishmentCost) : null,
      conditionPrice: i.conditionPrice ? Number(i.conditionPrice) : null,
      refurbishedAt: i.refurbishedAt?.toISOString() ?? null,
      restocked: i.restocked,
      createdAt: i.createdAt.toISOString(),
    }));

    const gradeBreakdown: Record<string, number> = {};
    for (const i of mapped) {
      const g = i.conditionGrade ?? 'UNGRADED';
      gradeBreakdown[g] = (gradeBreakdown[g] ?? 0) + i.quantity;
    }

    return {
      summary: {
        pendingCount: mapped.filter((i) => i.refurbishmentStatus === 'PENDING').length,
        inProgressCount: mapped.filter((i) => i.refurbishmentStatus === 'IN_PROGRESS').length,
        completedCount: mapped.filter((i) => i.refurbishmentStatus === 'COMPLETED').length,
        scrappedCount: mapped.filter((i) => i.refurbishmentStatus === 'SCRAPPED').length,
        totalRefurbCost: mapped.reduce((s, i) => s + (i.refurbishmentCost ?? 0), 0),
        totalConditionValue: mapped.reduce((s, i) => s + (i.conditionPrice ?? 0) * i.quantity, 0),
        gradeBreakdown,
      },
      items: mapped,
    };
  }
}
