import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export interface PlacementRecommendation {
  productId: string;
  productName: string;
  sku: string | null;
  totalStock: number;
  totalDemand: number;
  locations: LocationAllocation[];
  imbalanceScore: number; // 0 = perfect, higher = worse
}

export interface LocationAllocation {
  locationId: string;
  locationName: string;
  currentQty: number;
  demandShare: number; // % of total demand from this location
  recommendedQty: number;
  delta: number; // recommendedQty - currentQty (+move in, -move out)
}

export interface PlacementDashboard {
  recommendations: PlacementRecommendation[];
  summary: {
    productsAnalyzed: number;
    imbalancedProducts: number;
    totalRecommendedMoves: number;
    avgImbalanceScore: number;
  };
}

// ============================================================
// Service
// ============================================================

export class PlacementOptimizerService {
  /**
   * Analyze SKU demand by location and recommend optimal placement
   */
  static async getDashboard(tenantId: string, lookbackDays = 90): Promise<PlacementDashboard> {
    const since = new Date();
    since.setDate(since.getDate() - lookbackDays);

    // Get all locations for this tenant
    const locations = await prisma.location.findMany({
      where: { tenant: { id: tenantId } },
      select: { id: true, name: true },
    });

    if (locations.length < 2) {
      return {
        recommendations: [],
        summary: { productsAnalyzed: 0, imbalancedProducts: 0, totalRecommendedMoves: 0, avgImbalanceScore: 0 },
      };
    }

    // Get stock at all locations
    const stockAtLocations = await prisma.stockAtLocation.findMany({
      where: { locationId: { in: locations.map((l) => l.id) } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            tenantId: true,
            quantity: true,
            isActive: true,
          },
        },
        location: { select: { id: true, name: true } },
      },
    });

    // Filter to this tenant's active products
    const tenantStock = stockAtLocations.filter(
      (s) => s.product.tenantId === tenantId && s.product.isActive,
    );

    // Get demand by location (from SalesOrders shipped from each location)
    // We approximate demand per location by looking at sales order items
    // and which location fulfilled them
    const salesItems = await prisma.salesOrderItem.findMany({
      where: {
        order: {
          tenantId,
          createdAt: { gte: since },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          sourceLocationId: { not: null },
        },
        productId: { not: null },
      },
      select: {
        productId: true,
        quantity: true,
        order: {
          select: {
            sourceLocationId: true,
          },
        },
      },
    });

    // Build demand map: productId -> locationId -> totalDemand
    const demandMap = new Map<string, Map<string, number>>();
    for (const item of salesItems) {
      if (!item.productId) continue;
      const locationId = item.order.sourceLocationId;
      if (!locationId) continue;

      if (!demandMap.has(item.productId)) {
        demandMap.set(item.productId, new Map());
      }
      const locMap = demandMap.get(item.productId)!;
      locMap.set(locationId, (locMap.get(locationId) ?? 0) + item.quantity);
    }

    // Group stock by product
    const stockByProduct = new Map<string, typeof tenantStock>();
    for (const s of tenantStock) {
      const arr = stockByProduct.get(s.productId) || [];
      arr.push(s);
      stockByProduct.set(s.productId, arr);
    }

    const locationMap = new Map(locations.map((l) => [l.id, l.name]));
    const recommendations: PlacementRecommendation[] = [];

    for (const [productId, stocks] of stockByProduct) {
      if (stocks.length < 2) continue;

      const product = stocks[0].product;
      const totalStock = stocks.reduce((s, st) => s + st.quantity, 0);
      if (totalStock === 0) continue;

      const productDemand = demandMap.get(productId);
      const totalDemand = productDemand
        ? Array.from(productDemand.values()).reduce((s, v) => s + v, 0)
        : 0;

      // Build location allocations
      const locationAllocations: LocationAllocation[] = [];
      let imbalanceScore = 0;

      for (const stock of stocks) {
        const locDemand = productDemand?.get(stock.locationId) ?? 0;
        const demandShare = totalDemand > 0 ? locDemand / totalDemand : 1 / stocks.length;
        const recommendedQty = Math.round(totalStock * demandShare);
        const delta = recommendedQty - stock.quantity;

        imbalanceScore += Math.abs(delta);

        locationAllocations.push({
          locationId: stock.locationId,
          locationName: stock.location.name,
          currentQty: stock.quantity,
          demandShare: Math.round(demandShare * 100),
          recommendedQty,
          delta,
        });
      }

      // Add locations with demand but no stock
      if (productDemand) {
        for (const [locId, locDemand] of productDemand) {
          if (!stocks.some((s) => s.locationId === locId)) {
            const demandShare = totalDemand > 0 ? locDemand / totalDemand : 0;
            const recommendedQty = Math.round(totalStock * demandShare);

            if (recommendedQty > 0) {
              imbalanceScore += recommendedQty;
              locationAllocations.push({
                locationId: locId,
                locationName: locationMap.get(locId) ?? 'Unknown',
                currentQty: 0,
                demandShare: Math.round(demandShare * 100),
                recommendedQty,
                delta: recommendedQty,
              });
            }
          }
        }
      }

      // Normalize imbalance score (0 to 100)
      const normalizedScore = totalStock > 0 ? Math.min(100, Math.round((imbalanceScore / totalStock) * 50)) : 0;

      if (normalizedScore > 10) {
        // Only include if meaningfully imbalanced
        recommendations.push({
          productId,
          productName: product.name,
          sku: product.sku,
          totalStock,
          totalDemand,
          locations: locationAllocations.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
          imbalanceScore: normalizedScore,
        });
      }
    }

    // Sort by imbalance score (worst first)
    recommendations.sort((a, b) => b.imbalanceScore - a.imbalanceScore);
    const topRecs = recommendations.slice(0, 50);

    const imbalancedCount = topRecs.length;
    const totalMoves = topRecs.reduce(
      (s, r) => s + r.locations.filter((l) => l.delta !== 0).length,
      0,
    );
    const avgScore =
      imbalancedCount > 0
        ? Math.round(topRecs.reduce((s, r) => s + r.imbalanceScore, 0) / imbalancedCount)
        : 0;

    return {
      recommendations: topRecs,
      summary: {
        productsAnalyzed: stockByProduct.size,
        imbalancedProducts: imbalancedCount,
        totalRecommendedMoves: totalMoves,
        avgImbalanceScore: avgScore,
      },
    };
  }
}
