import prisma from '@/lib/prisma';
import { AutomationTrigger, AutomationAction, Prisma } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export interface CreateAutomationRuleInput {
  name: string;
  triggerType: AutomationTrigger;
  conditionJson?: Record<string, unknown>;
  actionType: AutomationAction;
  actionConfigJson?: Record<string, unknown>;
  cronExpression?: string;
  createdById: string;
}

export interface UpdateAutomationRuleInput {
  name?: string;
  triggerType?: AutomationTrigger;
  conditionJson?: Record<string, unknown>;
  actionType?: AutomationAction;
  actionConfigJson?: Record<string, unknown>;
  cronExpression?: string;
}

interface MatchedProduct {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  reorderPoint: number | null;
  safetyStock: number | null;
  costPrice: number;
  salePrice: number;
  abcClass: string | null;
  categoryId: string | null;
}

interface AutomationRuleWithLogs {
  id: string;
  name: string;
  triggerType: AutomationTrigger;
  conditionJson: unknown;
  cronExpression: string | null;
  actionType: AutomationAction;
  actionConfigJson: unknown;
  isActive: boolean;
  lastTriggeredAt: Date | null;
  triggerCount: number;
  createdById: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationResult {
  rulesEvaluated: number;
  rulesTriggered: number;
  totalActionsExecuted: number;
  details: {
    ruleId: string;
    ruleName: string;
    triggerType: string;
    matchedProducts: number;
    actionType: string;
    success: boolean;
    error?: string;
  }[];
}

// ============================================================
// Service
// ============================================================

export class AutomationService {
  /**
   * Create a new automation rule
   */
  static async create(tenantId: string, data: CreateAutomationRuleInput) {
    return prisma.automationRule.create({
      data: {
        name: data.name,
        triggerType: data.triggerType,
        conditionJson: data.conditionJson ? (data.conditionJson as Prisma.InputJsonValue) : undefined,
        actionType: data.actionType,
        actionConfigJson: data.actionConfigJson ? (data.actionConfigJson as Prisma.InputJsonValue) : undefined,
        cronExpression: data.cronExpression,
        createdById: data.createdById,
        tenantId,
      },
    });
  }

  /**
   * Update rule fields
   */
  static async update(id: string, tenantId: string, data: UpdateAutomationRuleInput) {
    const rule = await prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new Error('Automation rule not found');

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.triggerType !== undefined) updateData.triggerType = data.triggerType;
    if (data.conditionJson !== undefined) updateData.conditionJson = data.conditionJson as Prisma.InputJsonValue;
    if (data.actionType !== undefined) updateData.actionType = data.actionType;
    if (data.actionConfigJson !== undefined) updateData.actionConfigJson = data.actionConfigJson as Prisma.InputJsonValue;
    if (data.cronExpression !== undefined) updateData.cronExpression = data.cronExpression;

    return prisma.automationRule.update({ where: { id }, data: updateData });
  }

  /**
   * Delete a rule
   */
  static async delete(id: string, tenantId: string) {
    const rule = await prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new Error('Automation rule not found');
    return prisma.automationRule.delete({ where: { id } });
  }

  /**
   * List all rules with log count
   */
  static async list(tenantId: string) {
    const rules = await prisma.automationRule.findMany({
      where: { tenantId },
      include: {
        _count: { select: { logs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rules;
  }

  /**
   * Get single rule with recent logs
   */
  static async getById(id: string, tenantId: string) {
    const rule = await prisma.automationRule.findFirst({
      where: { id, tenantId },
      include: {
        logs: {
          orderBy: { triggeredAt: 'desc' },
          take: 50,
        },
        _count: { select: { logs: true } },
      },
    });

    if (!rule) throw new Error('Automation rule not found');
    return rule;
  }

  /**
   * Toggle isActive
   */
  static async toggleActive(id: string, tenantId: string) {
    const rule = await prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new Error('Automation rule not found');

    return prisma.automationRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  }

  /**
   * Main evaluation loop: load all active rules, check conditions, execute actions, log results
   */
  static async evaluate(tenantId: string): Promise<EvaluationResult> {
    const activeRules = await prisma.automationRule.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    const result: EvaluationResult = {
      rulesEvaluated: activeRules.length,
      rulesTriggered: 0,
      totalActionsExecuted: 0,
      details: [],
    };

    for (const rule of activeRules) {
      try {
        const matchedProducts = await this.findMatchingProducts(rule as AutomationRuleWithLogs, tenantId);

        if (matchedProducts.length === 0) {
          result.details.push({
            ruleId: rule.id,
            ruleName: rule.name,
            triggerType: rule.triggerType,
            matchedProducts: 0,
            actionType: rule.actionType,
            success: true,
          });
          continue;
        }

        // Execute the action
        const actionResult = await this.executeAction(rule as AutomationRuleWithLogs, matchedProducts, tenantId);

        // Update rule stats
        await prisma.automationRule.update({
          where: { id: rule.id },
          data: {
            lastTriggeredAt: new Date(),
            triggerCount: { increment: 1 },
          },
        });

        // Log execution
        await this.logExecution(
          rule.id,
          tenantId,
          `${rule.actionType}: ${matchedProducts.length} products matched`,
          actionResult,
          true,
        );

        result.rulesTriggered += 1;
        result.totalActionsExecuted += matchedProducts.length;
        result.details.push({
          ruleId: rule.id,
          ruleName: rule.name,
          triggerType: rule.triggerType,
          matchedProducts: matchedProducts.length,
          actionType: rule.actionType,
          success: true,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';

        await this.logExecution(
          rule.id,
          tenantId,
          `${rule.actionType}: FAILED`,
          null,
          false,
          errorMessage,
        );

        result.details.push({
          ruleId: rule.id,
          ruleName: rule.name,
          triggerType: rule.triggerType,
          matchedProducts: 0,
          actionType: rule.actionType,
          success: false,
          error: errorMessage,
        });
      }
    }

    return result;
  }

  /**
   * Find products that match the rule's trigger and conditions
   */
  private static async findMatchingProducts(
    rule: AutomationRuleWithLogs,
    tenantId: string,
  ): Promise<MatchedProduct[]> {
    const condition = (rule.conditionJson as Record<string, unknown>) || {};

    // Base filter for products
    const productWhere: Prisma.ProductWhereInput = {
      tenantId,
      isActive: true,
    };

    // Apply condition filters
    if (condition.category) {
      productWhere.categoryId = condition.category as string;
    }
    if (condition.abcClass) {
      productWhere.abcClass = condition.abcClass as string;
    }

    switch (rule.triggerType) {
      case 'STOCK_BELOW_REORDER': {
        // Find products where quantity <= reorderPoint
        const products = await prisma.product.findMany({
          where: {
            ...productWhere,
            reorderPoint: { not: null },
          },
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            reorderPoint: true,
            safetyStock: true,
            costPrice: true,
            salePrice: true,
            abcClass: true,
            categoryId: true,
          },
        });
        return products.filter(
          (p) => p.reorderPoint !== null && p.quantity <= p.reorderPoint,
        ).map((p) => ({
          ...p,
          costPrice: Number(p.costPrice),
          salePrice: Number(p.salePrice),
        }));
      }

      case 'STOCK_BELOW_SAFETY': {
        // Find products where quantity <= safetyStock
        const products = await prisma.product.findMany({
          where: {
            ...productWhere,
            safetyStock: { not: null },
          },
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            reorderPoint: true,
            safetyStock: true,
            costPrice: true,
            salePrice: true,
            abcClass: true,
            categoryId: true,
          },
        });
        return products.filter(
          (p) => p.safetyStock !== null && p.quantity <= p.safetyStock,
        ).map((p) => ({
          ...p,
          costPrice: Number(p.costPrice),
          salePrice: Number(p.salePrice),
        }));
      }

      case 'EXPIRY_APPROACHING': {
        const thresholdDays = (condition.thresholdDays as number) || 30;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);

        // Find product lots with approaching expiry
        const lots = await prisma.productLot.findMany({
          where: {
            tenantId,
            expiryDate: { not: null, lte: thresholdDate, gte: new Date() },
            quantity: { gt: 0 },
            product: productWhere,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                quantity: true,
                reorderPoint: true,
                safetyStock: true,
                costPrice: true,
                salePrice: true,
                abcClass: true,
                categoryId: true,
              },
            },
          },
        });

        // Deduplicate by product
        const seen = new Set<string>();
        const matched: MatchedProduct[] = [];
        for (const lot of lots) {
          if (!seen.has(lot.product.id)) {
            seen.add(lot.product.id);
            matched.push({
              ...lot.product,
              costPrice: Number(lot.product.costPrice),
              salePrice: Number(lot.product.salePrice),
            });
          }
        }
        return matched;
      }

      case 'DEMAND_SPIKE': {
        const spikeThresholdPct = (condition.spikeThresholdPct as number) || 50;

        // Compare last 7 days demand vs previous 30-day moving average
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const products = await prisma.product.findMany({
          where: productWhere,
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            reorderPoint: true,
            safetyStock: true,
            costPrice: true,
            salePrice: true,
            abcClass: true,
            categoryId: true,
          },
        });

        const matched: MatchedProduct[] = [];
        for (const product of products) {
          // Recent 7-day demand
          const recentItems = await prisma.salesOrderItem.aggregate({
            where: {
              productId: product.id,
              order: {
                tenantId,
                status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
                createdAt: { gte: sevenDaysAgo, lte: now },
              },
            },
            _sum: { quantity: true },
          });

          // 30-day demand
          const historicalItems = await prisma.salesOrderItem.aggregate({
            where: {
              productId: product.id,
              order: {
                tenantId,
                status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
                createdAt: { gte: thirtyDaysAgo, lte: now },
              },
            },
            _sum: { quantity: true },
          });

          const recentDailyAvg = (recentItems._sum.quantity || 0) / 7;
          const historicalDailyAvg = (historicalItems._sum.quantity || 0) / 30;

          if (historicalDailyAvg > 0) {
            const spikePercent = ((recentDailyAvg - historicalDailyAvg) / historicalDailyAvg) * 100;
            if (spikePercent >= spikeThresholdPct) {
              matched.push({
                ...product,
                costPrice: Number(product.costPrice),
                salePrice: Number(product.salePrice),
              });
            }
          }
        }
        return matched;
      }

      case 'SLOW_MOVER_DETECTED': {
        const velocityThreshold = (condition.velocityThreshold as number) || 0.1; // daily units

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const products = await prisma.product.findMany({
          where: { ...productWhere, quantity: { gt: 0 } },
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            reorderPoint: true,
            safetyStock: true,
            costPrice: true,
            salePrice: true,
            abcClass: true,
            categoryId: true,
          },
        });

        const matched: MatchedProduct[] = [];
        for (const product of products) {
          const salesAgg = await prisma.salesOrderItem.aggregate({
            where: {
              productId: product.id,
              order: {
                tenantId,
                status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
                createdAt: { gte: thirtyDaysAgo },
              },
            },
            _sum: { quantity: true },
          });

          const dailyVelocity = (salesAgg._sum.quantity || 0) / 30;
          if (dailyVelocity < velocityThreshold) {
            matched.push({
              ...product,
              costPrice: Number(product.costPrice),
              salePrice: Number(product.salePrice),
            });
          }
        }
        return matched;
      }

      case 'SCHEDULE': {
        // Schedule-based rules always match all products (filtered by conditions)
        const products = await prisma.product.findMany({
          where: productWhere,
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            reorderPoint: true,
            safetyStock: true,
            costPrice: true,
            salePrice: true,
            abcClass: true,
            categoryId: true,
          },
        });
        return products.map((p) => ({
          ...p,
          costPrice: Number(p.costPrice),
          salePrice: Number(p.salePrice),
        }));
      }

      default:
        return [];
    }
  }

  /**
   * Execute the action for a matched rule
   */
  static async executeAction(
    rule: AutomationRuleWithLogs,
    matchedProducts: MatchedProduct[],
    tenantId: string,
  ): Promise<Record<string, unknown>> {
    const actionConfig = (rule.actionConfigJson as Record<string, unknown>) || {};

    switch (rule.actionType) {
      case 'CREATE_PO_SUGGESTION': {
        // Create ReorderSuggestion records for each matched product
        const created: string[] = [];

        for (const product of matchedProducts) {
          // Check for existing pending suggestion to avoid duplicates
          const existing = await prisma.reorderSuggestion.findFirst({
            where: {
              productId: product.id,
              tenantId,
              status: 'PENDING',
            },
          });

          if (existing) continue;

          const leadTimeDays = (actionConfig.leadTimeDays as number) || 7;
          const avgDailyDemand = product.reorderPoint
            ? product.reorderPoint / leadTimeDays
            : 1;
          const suggestedQty = Math.max(
            1,
            Math.ceil(avgDailyDemand * leadTimeDays * 1.5) - product.quantity,
          );
          const estimatedCost = suggestedQty * product.costPrice;

          await prisma.reorderSuggestion.create({
            data: {
              productId: product.id,
              suggestedQty,
              currentStock: product.quantity,
              reorderPoint: product.reorderPoint || 0,
              safetyStock: product.safetyStock || 0,
              avgDailyDemand,
              leadTimeDays,
              estimatedCost,
              urgency: product.quantity <= (product.safetyStock || 0) ? 'CRITICAL' : 'NORMAL',
              daysUntilStockout:
                avgDailyDemand > 0
                  ? Math.floor(product.quantity / avgDailyDemand)
                  : null,
              tenantId,
            },
          });
          created.push(product.id);
        }

        return { action: 'CREATE_PO_SUGGESTION', suggestionsCreated: created.length, productIds: created };
      }

      case 'SEND_NOTIFICATION': {
        // Placeholder - log the notification intent
        const notifications = matchedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          message: `Automation "${rule.name}": ${p.name} (${p.sku || 'N/A'}) triggered notification. Stock: ${p.quantity}`,
        }));

        return { action: 'SEND_NOTIFICATION', notificationCount: notifications.length, notifications };
      }

      case 'ADJUST_PRICE': {
        // Create a PricingRule or apply price adjustment
        const discountPct = (actionConfig.discountPct as number) || 10;
        const adjustedProducts: string[] = [];

        for (const product of matchedProducts) {
          // Simple approach: update salePrice directly based on discount
          const newPrice = Math.round(product.salePrice * (1 - discountPct / 100) * 100) / 100;

          await prisma.product.update({
            where: { id: product.id },
            data: { salePrice: newPrice },
          });

          adjustedProducts.push(product.id);
        }

        return { action: 'ADJUST_PRICE', discountPct, adjustedCount: adjustedProducts.length, productIds: adjustedProducts };
      }

      case 'FLAG_FOR_REVIEW': {
        // Log with metadata for human review
        const flagged = matchedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          quantity: p.quantity,
          reason: `Flagged by automation "${rule.name}" (trigger: ${rule.triggerType})`,
        }));

        return { action: 'FLAG_FOR_REVIEW', flaggedCount: flagged.length, items: flagged };
      }

      case 'SEND_WEBHOOK': {
        // Placeholder - will be connected in P8-T7
        const payload = {
          rule: { id: rule.id, name: rule.name, triggerType: rule.triggerType },
          matchedProducts: matchedProducts.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            quantity: p.quantity,
          })),
          triggeredAt: new Date().toISOString(),
        };

        return { action: 'SEND_WEBHOOK', status: 'placeholder', payload };
      }

      default:
        return { action: 'UNKNOWN', message: 'Unsupported action type' };
    }
  }

  /**
   * Get available reorder preset templates
   */
  static getReorderPresets() {
    return [
      {
        id: 'reorder_basic',
        name: 'Auto-Reorder: Stock Below Reorder Point',
        description: 'Creates PO suggestions when inventory drops below reorder point',
        triggerType: 'STOCK_BELOW_REORDER' as AutomationTrigger,
        actionType: 'CREATE_PO_SUGGESTION' as AutomationAction,
        conditionJson: {},
        actionConfigJson: { leadTimeDays: 7 },
      },
      {
        id: 'reorder_safety',
        name: 'Auto-Reorder: Stock Below Safety Stock',
        description: 'Creates urgent PO suggestions when inventory drops below safety stock',
        triggerType: 'STOCK_BELOW_SAFETY' as AutomationTrigger,
        actionType: 'CREATE_PO_SUGGESTION' as AutomationAction,
        conditionJson: {},
        actionConfigJson: { leadTimeDays: 3 },
      },
      {
        id: 'reorder_a_class',
        name: 'Auto-Reorder: A-Class Products Only',
        description: 'Auto-reorder for high-value A-class products when below reorder point',
        triggerType: 'STOCK_BELOW_REORDER' as AutomationTrigger,
        actionType: 'CREATE_PO_SUGGESTION' as AutomationAction,
        conditionJson: { abcClass: 'A' },
        actionConfigJson: { leadTimeDays: 5 },
      },
      {
        id: 'notify_slow_movers',
        name: 'Alert: Slow-Moving Inventory',
        description: 'Flags slow movers (< 0.1 units/day) for review and potential markdown',
        triggerType: 'SLOW_MOVER_DETECTED' as AutomationTrigger,
        actionType: 'FLAG_FOR_REVIEW' as AutomationAction,
        conditionJson: { velocityThreshold: 0.1 },
        actionConfigJson: {},
      },
      {
        id: 'notify_demand_spike',
        name: 'Alert: Demand Spike Detected',
        description: 'Notifies when demand spikes 50%+ above 30-day average',
        triggerType: 'DEMAND_SPIKE' as AutomationTrigger,
        actionType: 'SEND_NOTIFICATION' as AutomationAction,
        conditionJson: { spikeThresholdPct: 50 },
        actionConfigJson: {},
      },
      {
        id: 'markdown_expiry',
        name: 'Auto-Markdown: Expiring Products',
        description: 'Reduces price by 20% for products expiring within 30 days',
        triggerType: 'EXPIRY_APPROACHING' as AutomationTrigger,
        actionType: 'ADJUST_PRICE' as AutomationAction,
        conditionJson: { thresholdDays: 30 },
        actionConfigJson: { discountPct: 20 },
      },
    ];
  }

  /**
   * Create an automation rule from a preset template
   */
  static async createFromPreset(
    tenantId: string,
    presetId: string,
    createdById: string,
  ) {
    const presets = this.getReorderPresets();
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) throw new Error(`Unknown preset: ${presetId}`);

    return this.create(tenantId, {
      name: preset.name,
      triggerType: preset.triggerType,
      conditionJson: preset.conditionJson,
      actionType: preset.actionType,
      actionConfigJson: preset.actionConfigJson,
      createdById,
    });
  }

  /**
   * Record execution in AutomationLog
   */
  static async logExecution(
    ruleId: string,
    tenantId: string,
    actionTaken: string,
    resultJson: Record<string, unknown> | null,
    success: boolean,
    errorMessage?: string,
  ) {
    return prisma.automationLog.create({
      data: {
        ruleId,
        tenantId,
        triggeredAt: new Date(),
        actionTaken,
        resultJson: resultJson ? (resultJson as Prisma.InputJsonValue) : undefined,
        success,
        errorMessage,
      },
    });
  }
}
