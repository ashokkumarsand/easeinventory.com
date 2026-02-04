import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { lookupBarcode, searchCatalog, validateBarcode } from '@/lib/barcode-api';

// GET /api/barcode/lookup?code=123456789012 - Look up product by barcode
// GET /api/barcode/lookup?q=search+term - Search catalog by name/brand
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('code');
    const query = searchParams.get('q');

    // Search by query
    if (query) {
      const results = await searchCatalog(query, 20);
      return NextResponse.json({
        success: true,
        results,
        count: results.length,
      });
    }

    // Lookup by barcode
    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode (code) or search query (q) is required' },
        { status: 400 }
      );
    }

    // Validate barcode format
    const validation = validateBarcode(barcode);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        format: validation.format,
      });
    }

    // Look up product
    const product = await lookupBarcode(barcode);

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found',
        barcode,
        format: validation.format,
        message: 'This barcode is not in our database. You can add it manually.',
      });
    }

    return NextResponse.json({
      success: true,
      product,
      format: validation.format,
    });
  } catch (error: any) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup barcode', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/barcode/lookup - Add product to catalog
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      barcode,
      name,
      description,
      brand,
      manufacturer,
      category,
      hsnCode,
      gstRate,
      mrp,
      imageUrl,
    } = body;

    if (!barcode || !name) {
      return NextResponse.json(
        { error: 'Barcode and name are required' },
        { status: 400 }
      );
    }

    // Validate barcode
    const validation = validateBarcode(barcode);
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Invalid barcode: ${validation.error}` },
        { status: 400 }
      );
    }

    // Import prisma dynamically to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma');

    // Create or update catalog entry
    const product = await prisma.productCatalog.upsert({
      where: { barcode },
      update: {
        name,
        description,
        brand,
        manufacturer,
        category,
        hsnCode,
        gstRate: gstRate || 18,
        mrp,
        imageUrl,
        source: 'USER_CONTRIBUTED',
        isVerified: false,
      },
      create: {
        barcode,
        name,
        description,
        brand,
        manufacturer,
        category,
        hsnCode,
        gstRate: gstRate || 18,
        mrp,
        imageUrl,
        source: 'USER_CONTRIBUTED',
        isVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      message: 'Product added to catalog',
    });
  } catch (error: any) {
    console.error('Add to catalog error:', error);
    return NextResponse.json(
      { error: 'Failed to add product', message: error.message },
      { status: 500 }
    );
  }
}
