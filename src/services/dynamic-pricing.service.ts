import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import { InventoryAnalyticsService } from './inventory-analytics.service';
import { PricingRuleStatus, PricingTrigger, PricingRuleScope, DiscountType, Prisma } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export interface PricingRecommendation {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  currentPrice: number;
  costPrice: number;
  triggerType: PricingTrigger;
  triggerMetric: number; // The actual metric value (stock level, days-of-supply, etc.)
  thresholdValue: number;
  adjustmentType: DiscountType;
  adjustmentValue: number;
  recommendedPrice: number;
  discountPct: number;
  margin: number; // Remaining margin after discount
  ruleId: string;
  ruleName: string;
}

export interface RecommendationSummary {
  totalRecommendations: number;
  totalPotentialRevenueSaved: number;
  avgDiscountPct: number;
  byTrigger: Record<string, number>;
}

export interface CreatePricingRuleInput {
  name: string;
  description?: string;
  triggerType: PricingTrigger;
  thresholdValue: number;
  thresholdOperator?: string;
  scope?: PricingRuleScope;
  scopeId?: string;
  adjustmentType?: DiscountType;
  adjustmentValue: number;
  isProgressive?: boolean;
  progressiveSteps?: { afterDays: number; value: number }[];
  startDate: Date;
  endDate?: Date;
  priority?: number;
  status?: PricingRuleStatus;
}

// ============================================================
// Service
// ============================================================

export class DynamicPricingService {
  /**
   * Create a new pricing rule
   */
  static async create(tenantId: string, userId: string, input: CreatePricingRuleInput) {
    const number = await generateNumber('PR', tenantId);

    return prisma.pricingRule.create({
      data: {
        number,
        name: input.name,
        description: input.description,
        triggerType: input.triggerType,
        thresholdValue: input.thresholdValue,
        thresholdOperator: input.thresholdOperator ?? 'gt',
        scope: input.scope ?? 'ALL',
        scopeId: input.scopeId,
        adjustmentType: input.adjustmentType ?? 'PERCENTAGE',
        adjustmentValue: input.adjustmentValue,
        isProgressive: input.isProgressive ?? false,
        progressiveSteps: input.progressiveSteps ? JSON.parse(JSON.stringify(input.progressiveSteps)) : undefined,
        startDate: input.startDate,
        endDate: input.endDate,
        priority: input.priority ?? 0,
        status: input.status ?? 'DRAFT',
        createdById: userId,
        tenantId,
      },
    });
  }

  /**
   * Update a pricing rule
   */
  static async update(id: string, tenantId: string, input: Partial<CreatePricingRuleInput>) {
    const rule = await prisma.pricingRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new Error('Pricing rule not found');

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.triggerType !== undefined) data.triggerType = input.triggerType;
    if (input.thresholdValue !== undefined) data.thresholdValue = input.thresholdValue;
    if (input.thresholdOperator !== undefined) data.thresholdOperator = input.thresholdOperator;
    if (input.scope !== undefined) data.scope = input.scope;
    if (input.scopeId !== undefined) data.scopeId = input.scopeId;
    if (input.adjustmentType !== undefined) data.adjustmentType = input.adjustmentType;
    if (input.adjustmentValue !== undefined) data.adjustmentValue = input.adjustmentValue;
    if (input.isProgressive !== undefined) data.isProgressive = input.isProgressive;
    if (input.progressiveSteps !== undefined) data.progressiveSteps = JSON.parse(JSON.stringify(input.progressiveSteps));
    if (input.startDate !== undefined) data.startDate = input.startDate;
    if (input.endDate !== undefined) data.endDate = input.endDate;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.status !== undefined) data.status = input.status;

    return prisma.pricingRule.update({ where: { id }, data });
  }

  /**
   * Delete a pricing rule
   */
  static async delete(id: string, tenantId: string) {
    const rule = await prisma.pricingRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new Error('Pricing rule not found');
    return prisma.pricingRule.delete({ where: { id } });
  }

  /**
   * Get a single pricing rule
   */
  static async getById(id: string, tenantId: string) {
    return prisma.pricingRule.findFirst({ where: { id, tenantId } });
  }

  /**
   * List pricing rules with pagination
   */
  static async list(
    tenantId: string,
    page = 1,
    pageSize = 50,
    status?: PricingRuleStatus,
  ) {
    const where: Prisma.PricingRuleWhereInput = {
      tenantId,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      prisma.pricingRule.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.pricingRule.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /**
   * Get products matching a rule's scope
   */
  private static async getProductsForScope(
    tenantId: string,
    scope: PricingRuleScope,
    scopeId: string | null,
  ) {
    const where: any = { tenantId, isActive: true };

    switch (scope) {
      case 'PRODUCT':
        if (scopeId) where.id = scopeId;
        break;
      case 'CATEGORY':
        if (scopeId) where.categoryId = scopeId;
        break;
      case 'ABC_CLASS':
        if (scopeId) where.abcClass = scopeId;
        break;
      case 'ALL':
      default:
        break;
    }

    return prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        salePrice: true,
        costPrice: true,
        leadTimeDays: true,
        abcClass: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Compare a metric against a threshold using the operator
   */
  private static meetsThreshold(metric: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt': return metric > threshold;
      case 'gte': return metric >= threshold;
      case 'lt': return metric < threshold;
      case 'lte': return metric <= threshold;
      default: return metric > threshold;
    }
  }

  /**
   * Compute the trigger metric for a product based on rule type
   */
  private static async computeMetric(
    product: { id: string; quantity: number; leadTimeDays: number | null; updatedAt: Date },
    tenantId: string,
    triggerType: PricingTrigger,
  ): Promise<number> {
    switch (triggerType) {
      case 'STOCK_LEVEL':
        return product.quantity;

      case 'DAYS_OF_SUPPLY': {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const dailyMap = await InventoryAnalyticsService.calculateDemand(product.id, tenantId, startDate, endDate);
        const totalQty = Array.from(dailyMap.values()).reduce((s, d) => s + d.quantity, 0);
        const avgDaily = totalQty / 30;
        return avgDaily > 0 ? product.quantity / avgDaily : 999;
      }

      case 'INVENTORY_AGE': {
        // Use last goods receipt date or product updatedAt as proxy
        const lastGrn = await prisma.goodsReceiptItem.findFirst({
          where: { productId: product.id, grn: { tenantId } },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        });
        const refDate = lastGrn?.createdAt ?? product.updatedAt;
        return Math.floor((Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      case 'SLOW_MOVER': {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const dailyMap = await InventoryAnalyticsService.calculateDemand(product.id, tenantId, startDate, endDate);
        const totalQty = Array.from(dailyMap.values()).reduce((s, d) => s + d.quantity, 0);
        return totalQty / 30; // avg daily velocity
      }

      case 'SCHEDULED':
        return 1; // Always matches for scheduled rules (gated by date)

      default:
        return 0;
    }
  }

  /**
   * Evaluate all active rules and generate recommendations
   */
  static async getRecommendations(
    tenantId: string,
    page = 1,
    pageSize = 50,
  ): Promise<{ summary: RecommendationSummary; recommendations: PricingRecommendation[]; total: number }> {
    const now = new Date();

    // Get all active rules whose date range includes now
    const rules = await prisma.pricingRule.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    if (rules.length === 0) {
      return {
        summary: { totalRecommendations: 0, totalPotentialRevenueSaved: 0, avgDiscountPct: 0, byTrigger: {} },
        recommendations: [],
        total: 0,
      };
    }

    const allRecs: PricingRecommendation[] = [];
    const seenProducts = new Set<string>(); // Highest-priority rule wins per product

    for (const rule of rules) {
      const products = await this.getProductsForScope(tenantId, rule.scope, rule.scopeId);

      for (const product of products) {
        if (seenProducts.has(product.id)) continue; // Higher-priority rule already matched

        const metric = await this.computeMetric(product, tenantId, rule.triggerType);
        if (!this.meetsThreshold(metric, rule.thresholdValue, rule.thresholdOperator)) continue;

        seenProducts.add(product.id);

        const salePrice = Number(product.salePrice);
        const costPrice = Number(product.costPrice);
        const adjValue = Number(rule.adjustmentValue);

        let discount: number;
        let recommendedPrice: number;

        if (rule.adjustmentType === 'PERCENTAGE') {
          discount = adjValue;
          recommendedPrice = Math.round(salePrice * (1 - adjValue / 100) * 100) / 100;
        } else {
          recommendedPrice = Math.max(costPrice, salePrice - adjValue);
          discount = salePrice > 0 ? Math.round(((salePrice - recommendedPrice) / salePrice) * 100 * 100) / 100 : 0;
        }

        const margin = recommendedPrice > 0 && costPrice > 0
          ? Math.round(((recommendedPrice - costPrice) / recommendedPrice) * 100 * 100) / 100
          : 0;

        allRecs.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: product.quantity,
          currentPrice: salePrice,
          costPrice,
          triggerType: rule.triggerType,
          triggerMetric: Math.round(metric * 100) / 100,
          thresholdValue: rule.thresholdValue,
          adjustmentType: rule.adjustmentType,
          adjustmentValue: adjValue,
          recommendedPrice,
          discountPct: discount,
          margin,
          ruleId: rule.id,
          ruleName: rule.name,
        });
      }
    }

    // Summary
    const totalPotentialRevenueSaved = allRecs.reduce(
      (s, r) => s + (r.currentPrice - r.recommendedPrice) * r.currentStock,
      0,
    );
    const avgDiscountPct = allRecs.length > 0
      ? Math.round(allRecs.reduce((s, r) => s + r.discountPct, 0) / allRecs.length * 100) / 100
      : 0;

    const byTrigger: Record<string, number> = {};
    for (const r of allRecs) {
      byTrigger[r.triggerType] = (byTrigger[r.triggerType] ?? 0) + 1;
    }

    // Paginate
    const paged = allRecs.slice((page - 1) * pageSize, page * pageSize);

    return {
      summary: {
        totalRecommendations: allRecs.length,
        totalPotentialRevenueSaved: Math.round(totalPotentialRevenueSaved * 100) / 100,
        avgDiscountPct,
        byTrigger,
      },
      recommendations: paged,
      total: allRecs.length,
    };
  }
}
