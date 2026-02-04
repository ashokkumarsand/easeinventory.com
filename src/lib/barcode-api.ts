import { prisma } from '@/lib/prisma';

// External API integrations for barcode lookup

interface ProductInfo {
  barcode: string;
  name: string;
  description?: string;
  brand?: string;
  manufacturer?: string;
  category?: string;
  imageUrl?: string;
  specifications?: Record<string, any>;
  source: 'LOCAL' | 'OPEN_FOOD_FACTS' | 'UPC_DATABASE' | 'GS1_INDIA';
}

/**
 * Look up product by barcode from multiple sources
 */
export async function lookupBarcode(barcode: string): Promise<ProductInfo | null> {
  // 1. First check local catalog
  const localProduct = await lookupLocalCatalog(barcode);
  if (localProduct) {
    // Increment usage count
    await prisma.productCatalog.update({
      where: { barcode },
      data: { usageCount: { increment: 1 } },
    });
    return localProduct;
  }

  // 2. Try Open Food Facts (free, food products)
  const offProduct = await lookupOpenFoodFacts(barcode);
  if (offProduct) {
    await saveToLocalCatalog(offProduct);
    return offProduct;
  }

  // 3. Could add more sources here (UPC Database, GS1 India, etc.)

  return null;
}

/**
 * Check local ProductCatalog database
 */
async function lookupLocalCatalog(barcode: string): Promise<ProductInfo | null> {
  const product = await prisma.productCatalog.findUnique({
    where: { barcode },
  });

  if (!product) return null;

  return {
    barcode: product.barcode,
    name: product.name,
    description: product.description || undefined,
    brand: product.brand || undefined,
    manufacturer: product.manufacturer || undefined,
    category: product.category || undefined,
    imageUrl: product.imageUrl || undefined,
    specifications: product.specifications as Record<string, any> || undefined,
    source: 'LOCAL',
  };
}

/**
 * Look up product from Open Food Facts API
 * https://world.openfoodfacts.org/api/v2/product/{barcode}
 */
async function lookupOpenFoodFacts(barcode: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'EaseInventory/1.0 (https://easeinventory.com)',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== 1 || !data.product) return null;

    const product = data.product;

    return {
      barcode,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      description: product.generic_name || product.generic_name_en || undefined,
      brand: product.brands || undefined,
      manufacturer: product.manufacturing_places || undefined,
      category: product.categories_tags?.[0]?.replace('en:', '') || undefined,
      imageUrl: product.image_url || product.image_front_url || undefined,
      specifications: {
        ingredients: product.ingredients_text,
        allergens: product.allergens,
        nutrition: product.nutriments,
        quantity: product.quantity,
        packaging: product.packaging,
        origins: product.origins,
      },
      source: 'OPEN_FOOD_FACTS',
    };
  } catch (error) {
    console.error('Open Food Facts lookup error:', error);
    return null;
  }
}

/**
 * Save product info to local catalog
 */
async function saveToLocalCatalog(product: ProductInfo): Promise<void> {
  try {
    await prisma.productCatalog.upsert({
      where: { barcode: product.barcode },
      update: {
        name: product.name,
        description: product.description,
        brand: product.brand,
        manufacturer: product.manufacturer,
        category: product.category,
        imageUrl: product.imageUrl,
        specifications: product.specifications,
        source: product.source === 'OPEN_FOOD_FACTS' ? 'OPEN_FOOD_FACTS' : 'MANUAL',
        usageCount: { increment: 1 },
      },
      create: {
        barcode: product.barcode,
        name: product.name,
        description: product.description,
        brand: product.brand,
        manufacturer: product.manufacturer,
        category: product.category,
        imageUrl: product.imageUrl,
        specifications: product.specifications,
        source: product.source === 'OPEN_FOOD_FACTS' ? 'OPEN_FOOD_FACTS' : 'MANUAL',
        usageCount: 1,
      },
    });
  } catch (error) {
    console.error('Failed to save to local catalog:', error);
  }
}

/**
 * Search products in catalog by name/brand
 */
export async function searchCatalog(query: string, limit: number = 10) {
  return prisma.productCatalog.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query } },
      ],
    },
    orderBy: [
      { usageCount: 'desc' },
      { name: 'asc' },
    ],
    take: limit,
  });
}

/**
 * Generate EAN-13 barcode for a product
 * Uses tenant prefix to ensure uniqueness
 */
export function generateEAN13(tenantPrefix: string, productNumber: number): string {
  // EAN-13 format: Country(3) + Company(4-5) + Product(4-5) + Check(1)
  // We'll use a simplified format: 890 (India) + tenant prefix (4) + product number (5) + check digit

  const countryCode = '890'; // India
  const tenantCode = tenantPrefix.substring(0, 4).padStart(4, '0');
  const productCode = productNumber.toString().padStart(5, '0');

  const partialBarcode = countryCode + tenantCode + productCode;
  const checkDigit = calculateEAN13CheckDigit(partialBarcode);

  return partialBarcode + checkDigit;
}

/**
 * Calculate EAN-13 check digit
 */
function calculateEAN13CheckDigit(partialBarcode: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(partialBarcode[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Validate barcode format
 */
export function validateBarcode(barcode: string): { valid: boolean; format?: string; error?: string } {
  // Remove any whitespace
  barcode = barcode.replace(/\s/g, '');

  // EAN-13 (13 digits)
  if (/^\d{13}$/.test(barcode)) {
    const checkDigit = calculateEAN13CheckDigit(barcode.substring(0, 12));
    if (checkDigit === barcode[12]) {
      return { valid: true, format: 'EAN-13' };
    }
    return { valid: false, format: 'EAN-13', error: 'Invalid check digit' };
  }

  // EAN-8 (8 digits)
  if (/^\d{8}$/.test(barcode)) {
    return { valid: true, format: 'EAN-8' };
  }

  // UPC-A (12 digits)
  if (/^\d{12}$/.test(barcode)) {
    return { valid: true, format: 'UPC-A' };
  }

  // Code 128 (alphanumeric)
  if (/^[A-Za-z0-9\-\.\/\+\%\$\s]+$/.test(barcode) && barcode.length >= 1 && barcode.length <= 48) {
    return { valid: true, format: 'Code-128' };
  }

  return { valid: false, error: 'Unrecognized barcode format' };
}

/**
 * Bulk import products from CSV data
 */
export async function bulkImportProducts(
  products: Array<{
    barcode: string;
    name: string;
    description?: string;
    brand?: string;
    category?: string;
    hsnCode?: string;
    gstRate?: number;
    mrp?: number;
  }>
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  for (const product of products) {
    try {
      if (!product.barcode || !product.name) {
        results.errors.push(`Missing required field for product: ${product.barcode || 'unknown'}`);
        results.skipped++;
        continue;
      }

      await prisma.productCatalog.upsert({
        where: { barcode: product.barcode },
        update: {
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category,
          hsnCode: product.hsnCode,
          gstRate: product.gstRate || 18,
          mrp: product.mrp,
          source: 'CSV_IMPORT',
        },
        create: {
          barcode: product.barcode,
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category,
          hsnCode: product.hsnCode,
          gstRate: product.gstRate || 18,
          mrp: product.mrp,
          source: 'CSV_IMPORT',
        },
      });
      results.imported++;
    } catch (error: any) {
      results.errors.push(`Error importing ${product.barcode}: ${error.message}`);
      results.skipped++;
    }
  }

  return results;
}
