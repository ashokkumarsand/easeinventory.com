import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export type LifecycleStage = 'INTRODUCTION' | 'GROWTH' | 'MATURITY' | 'DECLINE' | 'END_OF_LIFE';
export type SuggestionAction = 'ADD' | 'REMOVE' | 'PROMOTE' | 'MARKDOWN';
export type CategoryHealth = 'OVER_ASSORTED' | 'UNDER_ASSORTED' | 'BALANCED';
export type TrendDirection = 'UP' | 'STABLE' | 'DOWN';

export interface AssortmentScore {
  productId: string;
  productName: string;
  sku: string | null;
  categoryName: string | null;
  abcClass: string | null;
  xyzClass: string | null;
  compositeScore: number;
  components: {
    revenue: number;
    stability: number;
    margin: number;
    turnover: number;
    customerReach: number;
    trend: number;
  };
  lifecycle: LifecycleStage;
  recommendation: string;
  currentStock: number;
  costPrice: number;
  salePrice: number;
}

export interface CategoryAnalysis {
  categoryName: string;
  breadth: number;
  avgDepth: number;
  totalRevenue: number;
  revenueShare: number;
  health: CategoryHealth;
  lowPerformerPct: number;
  avgScore: number;
}

export interface AssortmentSuggestion {
  action: SuggestionAction;
  productId: string | null;
  productName: string | null;
  categoryName: string | null;
  reason: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number | null;
}

export interface AssortmentOverview {
  totalProducts: number;
  avgScore: number;
  scoreDistribution: { bucket: string; count: number }[];
  lifecycleDistribution: Record<LifecycleStage, number>;
  topPerformers: { productName: string; score: number }[];
  bottomPerformers: { productName: string; score: number }[];
  suggestionsCount: Record<SuggestionAction, number>;
}

// ============================================================
// Scoring weights
// ============================================================

const WEIGHTS = {
  revenue: 0.25,
  stability: 0.15,
  margin: 0.20,
  turnover: 0.15,
  customerReach: 0.10,
  trend: 0.15,
};

const ABC_SCORE: Record<string, number> = { A: 90, B: 60, C: 25 };
const XYZ_SCORE: Record<string, number> = { X: 90, Y: 55, Z: 20 };
const TREND_SCORE: Record<TrendDirection, number> = { UP: 85, STABLE: 50, DOWN: 15 };

// ============================================================
// Service
// ============================================================

export class AssortmentService {
  /**
   * Compute assortment scores for all active products
   */
  static async computeScores(
    tenantId: string,
    options: { search?: string; categoryId?: string; abcClass?: string; page?: number; pageSize?: number } = {},
  ): Promise<{ data: AssortmentScore[]; total: number; page: number; pageSize: number }> {
    const { search, categoryId, abcClass, page = 1, pageSize = 25 } = options;

    const where: any = { tenantId, isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (abcClass) where.abcClass = abcClass;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true, name: true, sku: true, quantity: true,
          costPrice: true, salePrice: true, abcClass: true, xyzClass: true,
          createdAt: true,
          category: { select: { name: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    if (products.length === 0) {
      return { data: [], total, page, pageSize };
    }

    const productIds = products.map(p => p.id);
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Fetch 90d revenue per product
    const revenueByProduct = await prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: ninetyDaysAgo },
        },
      },
      _sum: { total: true },
    });
    const revenueMap = new Map(revenueByProduct.map(r => [r.productId!, Number(r._sum.total ?? 0)]));

    // Unique customers per product
    const customerCounts = await prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: ninetyDaysAgo },
        },
      },
      _count: { _all: true },
    });

    // Get distinct customer counts via raw aggregation
    const customerReachMap = new Map<string, number>();
    for (const pid of productIds) {
      const orders = await prisma.salesOrder.findMany({
        where: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: ninetyDaysAgo },
          items: { some: { productId: pid } },
        },
        select: { customerId: true },
        distinct: ['customerId'],
      });
      customerReachMap.set(pid, orders.filter(o => o.customerId).length);
    }

    // Total unique customers
    const totalCustomers = await prisma.salesOrder.findMany({
      where: {
        tenantId,
        status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: ninetyDaysAgo },
      },
      select: { customerId: true },
      distinct: ['customerId'],
    });
    const totalUniqueCustomers = Math.max(totalCustomers.filter(o => o.customerId).length, 1);

    // Best forecast trend per product
    const forecasts = await prisma.demandForecast.findMany({
      where: {
        productId: { in: productIds },
        tenantId,
        isBest: true,
        isActive: true,
      },
      select: { productId: true, forecastData: true },
    });
    const forecastMap = new Map(forecasts.map(f => [f.productId, f.forecastData]));

    // Last sale date per product for lifecycle
    const lastSales = await prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      _max: { createdAt: true },
    });
    const lastSaleMap = new Map(lastSales.map(s => [s.productId!, s._max.createdAt]));

    // First sale date per product
    const firstSales = await prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      _min: { createdAt: true },
    });
    const firstSaleMap = new Map(firstSales.map(s => [s.productId!, s._min.createdAt]));

    // Compute scores
    const data: AssortmentScore[] = products.map(product => {
      const cost = Number(product.costPrice);
      const sale = Number(product.salePrice);
      const revenue90d = revenueMap.get(product.id) || 0;

      // Revenue score from ABC
      const revenueScore = ABC_SCORE[product.abcClass || ''] ?? 25;

      // Stability from XYZ
      const stabilityScore = XYZ_SCORE[product.xyzClass || ''] ?? 20;

      // Margin
      const marginPct = sale > 0 ? ((sale - cost) / sale) * 100 : 0;
      const marginScore = Math.min(100, Math.max(0, marginPct));

      // Turnover: 90d revenue / inventory value, normalized to 100 at 12x/yr (3x/90d)
      const inventoryValue = product.quantity * cost;
      const turnoverRatio = inventoryValue > 0 ? revenue90d / inventoryValue : 0;
      const turnoverScore = Math.min(100, (turnoverRatio / 3) * 100);

      // Customer reach
      const uniqueBuyers = customerReachMap.get(product.id) || 0;
      const reachScore = Math.min(100, (uniqueBuyers / totalUniqueCustomers) * 100);

      // Trend
      const trend = this.detectTrend(product.id, forecastMap);
      const trendScore = TREND_SCORE[trend];

      // Composite
      const compositeScore = Math.round(
        revenueScore * WEIGHTS.revenue +
        stabilityScore * WEIGHTS.stability +
        marginScore * WEIGHTS.margin +
        turnoverScore * WEIGHTS.turnover +
        reachScore * WEIGHTS.customerReach +
        trendScore * WEIGHTS.trend
      );

      // Lifecycle
      const lifecycle = this.classifyLifecycle(
        product.id, product.createdAt, lastSaleMap, firstSaleMap, trend, now,
      );

      // Recommendation
      const recommendation = compositeScore >= 75 ? 'Maintain / Expand'
        : compositeScore >= 50 ? 'Promote'
        : compositeScore >= 25 ? 'Markdown'
        : 'Discontinue';

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        categoryName: product.category?.name ?? null,
        abcClass: product.abcClass,
        xyzClass: product.xyzClass,
        compositeScore,
        components: {
          revenue: Math.round(revenueScore),
          stability: Math.round(stabilityScore),
          margin: Math.round(marginScore),
          turnover: Math.round(turnoverScore),
          customerReach: Math.round(reachScore),
          trend: Math.round(trendScore),
        },
        lifecycle,
        recommendation,
        currentStock: product.quantity,
        costPrice: cost,
        salePrice: sale,
      };
    });

    // Sort by composite score descending
    data.sort((a, b) => b.compositeScore - a.compositeScore);

    return { data, total, page, pageSize };
  }

  /**
   * Get a single product's assortment detail
   */
  static async getProductScore(productId: string, tenantId: string): Promise<AssortmentScore | null> {
    const result = await this.computeScores(tenantId, { page: 1, pageSize: 1000 });
    return result.data.find(s => s.productId === productId) ?? null;
  }

  /**
   * Get lifecycle distribution for all products
   */
  static async getLifecycleDistribution(tenantId: string): Promise<{
    distribution: Record<LifecycleStage, number>;
    products: { productId: string; productName: string; lifecycle: LifecycleStage; score: number }[];
  }> {
    const result = await this.computeScores(tenantId, { page: 1, pageSize: 5000 });
    const distribution: Record<LifecycleStage, number> = {
      INTRODUCTION: 0, GROWTH: 0, MATURITY: 0, DECLINE: 0, END_OF_LIFE: 0,
    };
    const products = result.data.map(s => {
      distribution[s.lifecycle]++;
      return { productId: s.productId, productName: s.productName, lifecycle: s.lifecycle, score: s.compositeScore };
    });
    return { distribution, products };
  }

  /**
   * Analyze category health
   */
  static async analyzeCategories(tenantId: string): Promise<CategoryAnalysis[]> {
    const allScores = await this.computeScores(tenantId, { page: 1, pageSize: 5000 });

    // Group by category
    const categoryMap = new Map<string, { scores: AssortmentScore[]; totalRevenue: number }>();
    let grandTotalRevenue = 0;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get revenue per product
    const revenueData = await prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: ninetyDaysAgo },
        },
        productId: { not: null },
      },
      _sum: { total: true },
    });
    const revenueMap = new Map(revenueData.map(r => [r.productId!, Number(r._sum.total ?? 0)]));

    for (const score of allScores.data) {
      const catName = score.categoryName || 'Uncategorized';
      const rev = revenueMap.get(score.productId) || 0;
      grandTotalRevenue += rev;

      const existing = categoryMap.get(catName) || { scores: [], totalRevenue: 0 };
      existing.scores.push(score);
      existing.totalRevenue += rev;
      categoryMap.set(catName, existing);
    }

    const categories: CategoryAnalysis[] = [];
    const breadths = Array.from(categoryMap.values()).map(c => c.scores.length);
    const medianBreadth = this.median(breadths);
    const avgRevenueShare = categoryMap.size > 0 ? 1 / categoryMap.size : 0;

    for (const [name, data] of categoryMap) {
      const breadth = data.scores.length;
      const avgDepth = data.scores.reduce((s, sc) => s + sc.currentStock, 0) / Math.max(breadth, 1);
      const revenueShare = grandTotalRevenue > 0 ? data.totalRevenue / grandTotalRevenue : 0;
      const avgScore = data.scores.reduce((s, sc) => s + sc.compositeScore, 0) / Math.max(breadth, 1);
      const lowPerformers = data.scores.filter(s => s.compositeScore < 25).length;
      const lowPerformerPct = breadth > 0 ? lowPerformers / breadth : 0;

      let health: CategoryHealth = 'BALANCED';
      if (breadth > 2 * medianBreadth && lowPerformerPct > 0.5) {
        health = 'OVER_ASSORTED';
      } else if (revenueShare > 1.5 * avgRevenueShare && breadth < medianBreadth / 2) {
        health = 'UNDER_ASSORTED';
      }

      categories.push({
        categoryName: name,
        breadth,
        avgDepth: Math.round(avgDepth),
        totalRevenue: Math.round(data.totalRevenue * 100) / 100,
        revenueShare: Math.round(revenueShare * 10000) / 10000,
        health,
        lowPerformerPct: Math.round(lowPerformerPct * 100) / 100,
        avgScore: Math.round(avgScore),
      });
    }

    categories.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return categories;
  }

  /**
   * Generate optimization suggestions
   */
  static async generateSuggestions(tenantId: string): Promise<AssortmentSuggestion[]> {
    const [allScores, categories] = await Promise.all([
      this.computeScores(tenantId, { page: 1, pageSize: 5000 }),
      this.analyzeCategories(tenantId),
    ]);

    const suggestions: AssortmentSuggestion[] = [];

    // REMOVE: Low scorers (<25) with declining lifecycle
    for (const score of allScores.data) {
      if (score.compositeScore < 25 && (score.lifecycle === 'DECLINE' || score.lifecycle === 'END_OF_LIFE')) {
        suggestions.push({
          action: 'REMOVE',
          productId: score.productId,
          productName: score.productName,
          categoryName: score.categoryName,
          reason: `Score ${score.compositeScore}/100, lifecycle: ${score.lifecycle}. Consider discontinuing.`,
          impact: score.currentStock > 0 ? 'HIGH' : 'LOW',
          score: score.compositeScore,
        });
      }
    }

    // MARKDOWN: Score 25-49, declining or end-of-life, has stock
    for (const score of allScores.data) {
      if (score.compositeScore >= 25 && score.compositeScore < 50 && score.currentStock > 0) {
        if (score.lifecycle === 'DECLINE' || score.lifecycle === 'END_OF_LIFE') {
          suggestions.push({
            action: 'MARKDOWN',
            productId: score.productId,
            productName: score.productName,
            categoryName: score.categoryName,
            reason: `Score ${score.compositeScore}/100 with ${score.currentStock} units in stock. Markdown to clear.`,
            impact: 'MEDIUM',
            score: score.compositeScore,
          });
        }
      }
    }

    // PROMOTE: Score 50-74, growing or maturity, has potential
    for (const score of allScores.data) {
      if (score.compositeScore >= 50 && score.compositeScore < 75) {
        if (score.lifecycle === 'GROWTH' || score.lifecycle === 'INTRODUCTION') {
          suggestions.push({
            action: 'PROMOTE',
            productId: score.productId,
            productName: score.productName,
            categoryName: score.categoryName,
            reason: `Score ${score.compositeScore}/100, ${score.lifecycle} stage. Increase visibility to boost sales.`,
            impact: 'MEDIUM',
            score: score.compositeScore,
          });
        }
      }
    }

    // ADD: Under-assorted categories
    for (const cat of categories) {
      if (cat.health === 'UNDER_ASSORTED') {
        suggestions.push({
          action: 'ADD',
          productId: null,
          productName: null,
          categoryName: cat.categoryName,
          reason: `"${cat.categoryName}" has ${(cat.revenueShare * 100).toFixed(1)}% revenue share but only ${cat.breadth} SKUs. Add more products.`,
          impact: 'HIGH',
          score: null,
        });
      }
    }

    // Sort by impact
    const impactOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    suggestions.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

    return suggestions;
  }

  /**
   * Get overview dashboard data
   */
  static async getOverview(tenantId: string): Promise<AssortmentOverview> {
    const allScores = await this.computeScores(tenantId, { page: 1, pageSize: 5000 });
    const suggestions = await this.generateSuggestions(tenantId);

    const scores = allScores.data;
    const totalProducts = scores.length;
    const avgScore = totalProducts > 0
      ? Math.round(scores.reduce((s, sc) => s + sc.compositeScore, 0) / totalProducts)
      : 0;

    // Score distribution buckets
    const buckets = ['0-24', '25-49', '50-74', '75-100'];
    const scoreDistribution = buckets.map(bucket => {
      const [min, max] = bucket.split('-').map(Number);
      return {
        bucket,
        count: scores.filter(s => s.compositeScore >= min && s.compositeScore <= max).length,
      };
    });

    // Lifecycle distribution
    const lifecycleDistribution: Record<LifecycleStage, number> = {
      INTRODUCTION: 0, GROWTH: 0, MATURITY: 0, DECLINE: 0, END_OF_LIFE: 0,
    };
    for (const s of scores) {
      lifecycleDistribution[s.lifecycle]++;
    }

    // Top/bottom performers
    const sorted = [...scores].sort((a, b) => b.compositeScore - a.compositeScore);
    const topPerformers = sorted.slice(0, 5).map(s => ({ productName: s.productName, score: s.compositeScore }));
    const bottomPerformers = sorted.slice(-5).reverse().map(s => ({ productName: s.productName, score: s.compositeScore }));

    // Suggestion counts
    const suggestionsCount: Record<SuggestionAction, number> = { ADD: 0, REMOVE: 0, PROMOTE: 0, MARKDOWN: 0 };
    for (const s of suggestions) {
      suggestionsCount[s.action]++;
    }

    return {
      totalProducts,
      avgScore,
      scoreDistribution,
      lifecycleDistribution,
      topPerformers,
      bottomPerformers,
      suggestionsCount,
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private static detectTrend(
    productId: string,
    forecastMap: Map<string, any>,
  ): TrendDirection {
    const forecastData = forecastMap.get(productId);
    if (!forecastData || !Array.isArray(forecastData) || forecastData.length < 2) {
      return 'STABLE';
    }

    const points = forecastData as { date: string; value: number }[];
    const firstHalf = points.slice(0, Math.floor(points.length / 2));
    const secondHalf = points.slice(Math.floor(points.length / 2));

    const avgFirst = firstHalf.reduce((s, p) => s + p.value, 0) / Math.max(firstHalf.length, 1);
    const avgSecond = secondHalf.reduce((s, p) => s + p.value, 0) / Math.max(secondHalf.length, 1);

    const ratio = avgFirst > 0 ? avgSecond / avgFirst : 1;
    if (ratio > 1.15) return 'UP';
    if (ratio < 0.85) return 'DOWN';
    return 'STABLE';
  }

  private static classifyLifecycle(
    productId: string,
    createdAt: Date,
    lastSaleMap: Map<string, Date | null>,
    firstSaleMap: Map<string, Date | null>,
    trend: TrendDirection,
    now: Date,
  ): LifecycleStage {
    const lastSale = lastSaleMap.get(productId);
    const firstSale = firstSaleMap.get(productId);

    // No sales in 90d+ → END_OF_LIFE
    if (lastSale) {
      const daysSinceLastSale = Math.floor((now.getTime() - lastSale.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastSale > 90) return 'END_OF_LIFE';
    } else {
      // Never sold — check product age
      const productAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (productAge > 90) return 'END_OF_LIFE';
      return 'INTRODUCTION';
    }

    // First sale < 60d ago → INTRODUCTION
    if (firstSale) {
      const daysSinceFirst = Math.floor((now.getTime() - firstSale.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceFirst < 60) return 'INTRODUCTION';

      // Trend UP + < 365d old → GROWTH
      if (trend === 'UP' && daysSinceFirst < 365) return 'GROWTH';

      // Trend DOWN + > 180d old → DECLINE
      if (trend === 'DOWN' && daysSinceFirst > 180) return 'DECLINE';
    }

    return 'MATURITY';
  }

  private static median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
}
