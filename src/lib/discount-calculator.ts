import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface ProductForDiscount {
  id: string;
  salePrice: Decimal | number;
  discount: Decimal | number;
  categoryId?: string | null;
  supplierId?: string | null;
  brand?: string | null;
}

interface AppliedDiscount {
  discountId: string;
  discountName: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
}

interface ProductWithDiscount extends ProductForDiscount {
  effectiveDiscount: number;
  effectivePrice: number;
  appliedDiscounts: AppliedDiscount[];
}

/**
 * Get active blanket discounts for a tenant
 */
export async function getActiveBlanketDiscounts(tenantId: string) {
  const now = new Date();

  const discounts = await prisma.blanketDiscount.findMany({
    where: {
      tenantId,
      isActive: true,
      startDate: { lte: now },
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
    orderBy: { priority: 'desc' },
  });

  // Filter out discounts that have exceeded max usage
  return discounts.filter(d =>
    d.maxUsageCount === null || d.usageCount < d.maxUsageCount
  );
}

/**
 * Calculate effective discount for a single product
 */
export function calculateProductDiscount(
  product: ProductForDiscount,
  blanketDiscounts: any[],
  quantity: number = 1,
  orderValue: number = 0
): ProductWithDiscount {
  const salePrice = Number(product.salePrice);
  const itemDiscount = Number(product.discount);
  const appliedDiscounts: AppliedDiscount[] = [];

  // Start with item-level discount
  let totalDiscountPercent = itemDiscount;
  let totalFixedDiscount = 0;

  // Find applicable blanket discounts
  for (const discount of blanketDiscounts) {
    // Check if discount applies to this product
    let applies = false;

    switch (discount.scope) {
      case 'ALL':
        applies = true;
        break;
      case 'CATEGORY':
        applies = product.categoryId === discount.scopeId;
        break;
      case 'SUPPLIER':
        applies = product.supplierId === discount.scopeId;
        break;
      case 'BRAND':
        applies = product.brand?.toLowerCase() === discount.scopeId?.toLowerCase();
        break;
    }

    if (!applies) continue;

    // Check quantity requirement
    if (discount.minQuantity && quantity < discount.minQuantity) continue;

    // Check order value requirement
    if (discount.minOrderValue && orderValue < Number(discount.minOrderValue)) continue;

    // Apply discount
    const discountValue = Number(discount.discountValue);

    if (discount.discountType === 'PERCENTAGE') {
      totalDiscountPercent += discountValue;
      appliedDiscounts.push({
        discountId: discount.id,
        discountName: discount.name,
        discountType: 'PERCENTAGE',
        discountValue,
        discountAmount: (salePrice * discountValue) / 100,
      });
    } else {
      totalFixedDiscount += discountValue;
      appliedDiscounts.push({
        discountId: discount.id,
        discountName: discount.name,
        discountType: 'FIXED',
        discountValue,
        discountAmount: discountValue,
      });
    }
  }

  // Cap percentage discount at 100%
  totalDiscountPercent = Math.min(totalDiscountPercent, 100);

  // Calculate effective price
  const percentageDiscount = (salePrice * totalDiscountPercent) / 100;
  const totalDiscount = percentageDiscount + totalFixedDiscount;
  const effectivePrice = Math.max(0, salePrice - totalDiscount);

  return {
    ...product,
    effectiveDiscount: totalDiscountPercent + (totalFixedDiscount / salePrice * 100),
    effectivePrice,
    appliedDiscounts,
  };
}

/**
 * Calculate discounts for multiple products
 */
export async function calculateBulkDiscounts(
  tenantId: string,
  products: ProductForDiscount[],
  quantities: Record<string, number> = {},
  orderValue: number = 0
): Promise<ProductWithDiscount[]> {
  const blanketDiscounts = await getActiveBlanketDiscounts(tenantId);

  return products.map(product => calculateProductDiscount(
    product,
    blanketDiscounts,
    quantities[product.id] || 1,
    orderValue
  ));
}

/**
 * Increment usage count for a discount
 */
export async function incrementDiscountUsage(discountId: string) {
  await prisma.blanketDiscount.update({
    where: { id: discountId },
    data: {
      usageCount: { increment: 1 },
    },
  });
}
