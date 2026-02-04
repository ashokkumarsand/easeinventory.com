import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bulkImportProducts } from '@/lib/barcode-api';
import { prisma } from '@/lib/prisma';

// POST /api/products/import - Bulk import products from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as any;
    const tenantId = sessionUser.tenantId;
    const role = sessionUser.role;

    // Only managers and above can import
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { products, importType = 'catalog' } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      );
    }

    if (products.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 products per import' },
        { status: 400 }
      );
    }

    if (importType === 'catalog') {
      // Import to global product catalog
      const result = await bulkImportProducts(products);

      return NextResponse.json({
        success: true,
        ...result,
        message: `Imported ${result.imported} products, skipped ${result.skipped}`,
      });
    } else if (importType === 'inventory') {
      // Import directly to tenant's inventory
      if (!tenantId || tenantId === 'system') {
        return NextResponse.json(
          { error: 'Valid tenant context required for inventory import' },
          { status: 400 }
        );
      }

      const results = { imported: 0, skipped: 0, errors: [] as string[] };

      for (const product of products) {
        try {
          if (!product.name) {
            results.errors.push(`Missing name for product`);
            results.skipped++;
            continue;
          }

          // Generate SKU if not provided
          const sku = product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

          // Check for existing product by SKU or barcode
          const existing = await prisma.product.findFirst({
            where: {
              tenantId,
              OR: [
                { sku },
                ...(product.barcode ? [{ barcode: product.barcode }] : []),
              ],
            },
          });

          if (existing) {
            // Update existing
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                name: product.name,
                description: product.description,
                barcode: product.barcode,
                hsnCode: product.hsnCode,
                costPrice: product.costPrice,
                modalPrice: product.mrp || product.modalPrice,
                salePrice: product.salePrice || product.mrp,
                quantity: product.quantity || existing.quantity,
                gstRate: product.gstRate || 18,
              },
            });
          } else {
            // Create new
            await prisma.product.create({
              data: {
                tenantId,
                name: product.name,
                slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: product.description,
                sku,
                barcode: product.barcode,
                hsnCode: product.hsnCode,
                costPrice: product.costPrice || 0,
                modalPrice: product.mrp || product.modalPrice || 0,
                salePrice: product.salePrice || product.mrp || 0,
                quantity: product.quantity || 0,
                gstRate: product.gstRate || 18,
                unit: product.unit || 'PCS',
              },
            });
          }

          results.imported++;
        } catch (error: any) {
          results.errors.push(`Error importing ${product.name}: ${error.message}`);
          results.skipped++;
        }
      }

      return NextResponse.json({
        success: true,
        ...results,
        message: `Imported ${results.imported} products to inventory, skipped ${results.skipped}`,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid import type. Use "catalog" or "inventory"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Product import error:', error);
    return NextResponse.json(
      { error: 'Failed to import products', message: error.message },
      { status: 500 }
    );
  }
}

// GET /api/products/import/template - Get CSV template
export async function GET() {
  const template = `barcode,name,description,brand,category,hsnCode,gstRate,mrp,costPrice,salePrice,quantity,unit
8901234567890,Sample Product,Product description,Brand Name,Electronics,85176290,18,999.00,500.00,899.00,100,PCS
,Another Product,No barcode needed,Other Brand,Accessories,39269099,12,299.00,150.00,249.00,50,PCS`;

  return new NextResponse(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="product_import_template.csv"',
    },
  });
}
