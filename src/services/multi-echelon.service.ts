import prisma from '@/lib/prisma';

/**
 * Multi-Echelon Inventory Optimization Service
 *
 * Implements echelon base-stock policies for hierarchical warehouse networks.
 * Analyzes cross-warehouse demand, lead times, and stock to recommend
 * optimal distribution of inventory across the network.
 */

interface LocationNode {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  currentLoad: number;
  capacity: number | null;
}

interface SkuEchelonData {
  productId: string;
  productName: string;
  sku: string | null;
  totalStock: number;
  totalDemand: number;
  locations: Array<{
    locationId: string;
    locationName: string;
    currentStock: number;
    demandRate: number; // units per day
    daysOfSupply: number;
    optimalStock: number;
    delta: number; // optimal - current (positive = needs more, negative = excess)
    serviceLevel: number; // 0-100%
  }>;
  networkImbalance: number; // 0-100 score
  recommendation: string;
}

interface EchelonAlert {
  id: string;
  type: 'low_stock' | 'overstock' | 'imbalance';
  severity: 'critical' | 'warning' | 'info';
  productId: string;
  productName: string;
  sku: string | null;
  locationId?: string;
  locationName?: string;
  currentValue: number;
  optimalValue: number;
  message: string;
}

interface RebalanceRecommendation {
  productId: string;
  productName: string;
  sku: string | null;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantity: number;
  reason: string;
}

interface EchelonAlerts {
  summary: { critical: number; warning: number; info: number };
  alerts: EchelonAlert[];
  recommendations: RebalanceRecommendation[];
}

interface EchelonPolicy {
  productId: string;
  locationId: string;
  baseStockLevel: number;
  reorderPoint: number;
  safetyStock: number;
}

interface EchelonDashboard {
  summary: {
    totalLocations: number;
    totalSkusAnalyzed: number;
    imbalancedSkus: number;
    avgNetworkImbalance: number;
    totalRecommendedMoves: number;
    potentialSavings: number; // estimated carrying cost savings
  };
  skuAnalysis: SkuEchelonData[];
  policies: EchelonPolicy[];
  networkHealth: Array<{
    locationId: string;
    locationName: string;
    type: string;
    overStocked: number;
    underStocked: number;
    balanced: number;
    utilizationPct: number;
  }>;
}

export class MultiEchelonService {
  static async getDashboard(
    tenantId: string,
    lookbackDays = 90,
    serviceLevelTarget = 0.95
  ): Promise<EchelonDashboard> {
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

    // 1. Get all active locations
    const locations = await prisma.location.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        parentId: true,
        currentLoad: true,
        capacity: true,
      },
    });

    if (locations.length < 2) {
      return {
        summary: {
          totalLocations: locations.length,
          totalSkusAnalyzed: 0,
          imbalancedSkus: 0,
          avgNetworkImbalance: 0,
          totalRecommendedMoves: 0,
          potentialSavings: 0,
        },
        skuAnalysis: [],
        policies: [],
        networkHealth: [],
      };
    }

    const locationIds = locations.map((l) => l.id);

    // 2. Get stock at each location
    const stockAtLocations = await prisma.stockAtLocation.findMany({
      where: { locationId: { in: locationIds } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            costPrice: true,
            salePrice: true,
            tenantId: true,
          },
        },
      },
    });

    // Filter to only products belonging to this tenant
    const tenantStock = stockAtLocations.filter(
      (s) => s.product.tenantId === tenantId
    );

    // 3. Get demand data from sales orders (aggregate per product)
    const salesItems = await prisma.salesOrderItem.findMany({
      where: {
        order: {
          tenantId,
          createdAt: { gte: lookbackDate },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      select: {
        productId: true,
        quantity: true,
      },
    });

    // Build demand map: productId -> total demand (distributed across stock locations later)
    const demandByProduct = new Map<string, number>();
    for (const item of salesItems) {
      if (!item.productId) continue;
      demandByProduct.set(item.productId, (demandByProduct.get(item.productId) || 0) + item.quantity);
    }

    // Build demand map: productId -> locationId -> proportional demand based on stock distribution
    const demandMap = new Map<string, Map<string, number>>();
    for (const [productId, totalDemand] of demandByProduct) {
      const stockForProduct = tenantStock.filter((s) => s.productId === productId);
      const totalStock = stockForProduct.reduce((sum, s) => sum + s.quantity, 0);
      const locDemand = new Map<string, number>();
      for (const s of stockForProduct) {
        const proportion = totalStock > 0 ? s.quantity / totalStock : 1 / stockForProduct.length;
        locDemand.set(s.locationId, Math.round(totalDemand * proportion));
      }
      demandMap.set(productId, locDemand);
    }

    // 4. Build per-SKU echelon analysis
    const productMap = new Map<string, typeof tenantStock>();
    for (const s of tenantStock) {
      if (!productMap.has(s.productId)) {
        productMap.set(s.productId, []);
      }
      productMap.get(s.productId)!.push(s);
    }

    const locationMap = new Map(locations.map((l) => [l.id, l]));
    const skuAnalysis: SkuEchelonData[] = [];
    const policies: EchelonPolicy[] = [];
    let totalRecommendedMoves = 0;
    let totalPotentialSavings = 0;

    for (const [productId, stockEntries] of productMap) {
      const product = stockEntries[0].product;
      const productDemand = demandMap.get(productId) || new Map();
      const totalStock = stockEntries.reduce((sum, s) => sum + s.quantity, 0);
      const totalDemand = Array.from(productDemand.values()).reduce((s, d) => s + d, 0);
      const dailyDemandRate = totalDemand / lookbackDays;

      if (totalStock === 0 && totalDemand === 0) continue;

      const locAnalysis: SkuEchelonData['locations'] = [];

      for (const loc of locations) {
        const stock = stockEntries.find((s) => s.locationId === loc.id);
        const currentStock = stock?.quantity || 0;
        const locDemand = productDemand.get(loc.id) || 0;
        const locDailyDemand = locDemand / lookbackDays;

        // Calculate optimal stock using echelon base-stock policy
        // Optimal = (daily demand * lead time buffer) + safety stock
        const leadTimeDays = 7; // default assumption
        const zScore = 1.65; // ~95% service level
        const demandStdDev = locDailyDemand * 0.3; // assume 30% CV
        const safetyStock = Math.ceil(zScore * demandStdDev * Math.sqrt(leadTimeDays));
        const optimalStock = Math.ceil(locDailyDemand * leadTimeDays) + safetyStock;

        const daysOfSupply = locDailyDemand > 0
          ? Math.round(currentStock / locDailyDemand)
          : currentStock > 0 ? 999 : 0;

        const serviceLevel = optimalStock > 0
          ? Math.min(100, Math.round((currentStock / optimalStock) * 100))
          : currentStock > 0 ? 100 : 0;

        const delta = optimalStock - currentStock;

        locAnalysis.push({
          locationId: loc.id,
          locationName: loc.name,
          currentStock,
          demandRate: Math.round(locDailyDemand * 100) / 100,
          daysOfSupply,
          optimalStock,
          delta,
          serviceLevel,
        });

        // Generate echelon policy
        if (locDailyDemand > 0 || currentStock > 0) {
          policies.push({
            productId,
            locationId: loc.id,
            baseStockLevel: optimalStock,
            reorderPoint: Math.ceil(locDailyDemand * leadTimeDays * 0.5) + safetyStock,
            safetyStock,
          });
        }
      }

      // Calculate network imbalance
      const locationsWithDemand = locAnalysis.filter((l) => l.demandRate > 0);
      let imbalance = 0;
      if (locationsWithDemand.length > 0) {
        const avgService = locationsWithDemand.reduce((s, l) => s + l.serviceLevel, 0) / locationsWithDemand.length;
        const serviceVariance = locationsWithDemand.reduce(
          (s, l) => s + Math.pow(l.serviceLevel - avgService, 2), 0
        ) / locationsWithDemand.length;
        imbalance = Math.min(100, Math.round(Math.sqrt(serviceVariance)));
      }

      // Count recommended moves
      const needsMore = locAnalysis.filter((l) => l.delta > 5);
      const hasExcess = locAnalysis.filter((l) => l.delta < -5);
      const moves = Math.min(needsMore.length, hasExcess.length);
      totalRecommendedMoves += moves;

      // Estimate savings from rebalancing
      const costPrice = Number(product.costPrice || 0);
      const excessUnits = hasExcess.reduce((s, l) => s + Math.abs(l.delta), 0);
      const carryingCostRate = 0.25; // 25% annual carrying cost
      totalPotentialSavings += excessUnits * costPrice * carryingCostRate / 12; // monthly savings

      let recommendation = 'Balanced';
      if (imbalance > 30) {
        recommendation = `Rebalance: move stock from ${hasExcess.map((l) => l.locationName).join(', ')} to ${needsMore.map((l) => l.locationName).join(', ')}`;
      } else if (totalStock < Math.ceil(dailyDemandRate * 14)) {
        recommendation = 'Low network stock — consider replenishment';
      }

      skuAnalysis.push({
        productId,
        productName: product.name,
        sku: product.sku,
        totalStock,
        totalDemand,
        locations: locAnalysis,
        networkImbalance: imbalance,
        recommendation,
      });
    }

    // Sort by imbalance descending, take top 50
    skuAnalysis.sort((a, b) => b.networkImbalance - a.networkImbalance);
    const topSkus = skuAnalysis.slice(0, 50);
    const imbalancedSkus = skuAnalysis.filter((s) => s.networkImbalance > 15).length;

    // 5. Network health per location
    const networkHealth = locations.map((loc) => {
      const locSkus = skuAnalysis.map((s) => s.locations.find((l) => l.locationId === loc.id)).filter(Boolean);
      const overStocked = locSkus.filter((l) => l && l.delta < -5).length;
      const underStocked = locSkus.filter((l) => l && l.delta > 5).length;
      const balanced = locSkus.length - overStocked - underStocked;
      const utilizationPct = loc.capacity
        ? Math.round((loc.currentLoad / loc.capacity) * 100)
        : 0;

      return {
        locationId: loc.id,
        locationName: loc.name,
        type: loc.type,
        overStocked,
        underStocked,
        balanced,
        utilizationPct,
      };
    });

    const avgImbalance = skuAnalysis.length > 0
      ? Math.round(skuAnalysis.reduce((s, sk) => s + sk.networkImbalance, 0) / skuAnalysis.length)
      : 0;

    return {
      summary: {
        totalLocations: locations.length,
        totalSkusAnalyzed: skuAnalysis.length,
        imbalancedSkus,
        avgNetworkImbalance: avgImbalance,
        totalRecommendedMoves,
        potentialSavings: Math.round(totalPotentialSavings),
      },
      skuAnalysis: topSkus,
      policies: policies.slice(0, 200),
      networkHealth,
    };
  }

  static async getAlerts(tenantId: string): Promise<EchelonAlerts> {
    const dashboard = await this.getDashboard(tenantId, 90, 0.95);
    const alerts: EchelonAlert[] = [];
    const recommendations: RebalanceRecommendation[] = [];
    let alertCounter = 0;

    for (const sku of dashboard.skuAnalysis) {
      for (const loc of sku.locations) {
        if (loc.demandRate === 0 && loc.currentStock === 0) continue;

        // Low stock: serviceLevel < 50%
        if (loc.serviceLevel < 50 && loc.optimalStock > 0) {
          alerts.push({
            id: `alert-${++alertCounter}`,
            type: 'low_stock',
            severity: loc.serviceLevel < 25 ? 'critical' : 'warning',
            productId: sku.productId,
            productName: sku.productName,
            sku: sku.sku,
            locationId: loc.locationId,
            locationName: loc.locationName,
            currentValue: loc.currentStock,
            optimalValue: loc.optimalStock,
            message: `${sku.productName} at ${loc.locationName}: only ${loc.currentStock} units vs ${loc.optimalStock} optimal (${loc.serviceLevel}% service level)`,
          });
        }

        // Overstock: serviceLevel > 200%
        if (loc.serviceLevel > 200) {
          alerts.push({
            id: `alert-${++alertCounter}`,
            type: 'overstock',
            severity: 'info',
            productId: sku.productId,
            productName: sku.productName,
            sku: sku.sku,
            locationId: loc.locationId,
            locationName: loc.locationName,
            currentValue: loc.currentStock,
            optimalValue: loc.optimalStock,
            message: `${sku.productName} at ${loc.locationName}: ${loc.currentStock} units vs ${loc.optimalStock} optimal (excess stock)`,
          });
        }
      }

      // Imbalance: networkImbalance > 30%
      if (sku.networkImbalance > 30) {
        alerts.push({
          id: `alert-${++alertCounter}`,
          type: 'imbalance',
          severity: sku.networkImbalance > 50 ? 'critical' : 'warning',
          productId: sku.productId,
          productName: sku.productName,
          sku: sku.sku,
          currentValue: sku.networkImbalance,
          optimalValue: 15,
          message: `${sku.productName}: network imbalance at ${sku.networkImbalance}% — stock unevenly distributed`,
        });

        // Generate rebalancing recommendations
        const excess = sku.locations
          .filter((l) => l.delta < -5)
          .sort((a, b) => a.delta - b.delta); // most excess first
        const deficit = sku.locations
          .filter((l) => l.delta > 5)
          .sort((a, b) => b.delta - a.delta); // most needed first

        let ei = 0;
        let di = 0;
        while (ei < excess.length && di < deficit.length) {
          const from = excess[ei];
          const to = deficit[di];
          const transferQty = Math.min(Math.abs(from.delta), to.delta);
          if (transferQty > 0) {
            recommendations.push({
              productId: sku.productId,
              productName: sku.productName,
              sku: sku.sku,
              fromLocationId: from.locationId,
              fromLocationName: from.locationName,
              toLocationId: to.locationId,
              toLocationName: to.locationName,
              quantity: transferQty,
              reason: `Move ${transferQty} units to improve service level at ${to.locationName}`,
            });
          }
          excess[ei] = { ...from, delta: from.delta + transferQty };
          deficit[di] = { ...to, delta: to.delta - transferQty };
          if (Math.abs(excess[ei].delta) <= 5) ei++;
          if (deficit[di].delta <= 5) di++;
        }
      }
    }

    // Sort alerts: critical first, then warning, then info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      summary: {
        critical: alerts.filter((a) => a.severity === 'critical').length,
        warning: alerts.filter((a) => a.severity === 'warning').length,
        info: alerts.filter((a) => a.severity === 'info').length,
      },
      alerts: alerts.slice(0, 100),
      recommendations: recommendations.slice(0, 50),
    };
  }
}
