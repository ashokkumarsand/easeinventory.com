import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateEAN13 } from '@/lib/barcode-api';
import { prisma } from '@/lib/prisma';

// POST /api/barcode/generate - Generate a new unique barcode
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as any;
    const tenantId = sessionUser.tenantId;

    if (!tenantId || tenantId === 'system') {
      return NextResponse.json(
        { error: 'Valid tenant context required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { format = 'EAN-13', productName } = body;

    // Get tenant info for prefix
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Generate unique product number
    // Count existing products to generate sequential number
    const productCount = await prisma.product.count({
      where: { tenantId },
    });

    const productNumber = productCount + 1;

    // Generate barcode based on format
    let barcode: string;

    if (format === 'EAN-13') {
      // Use tenant slug as prefix (first 4 chars)
      const tenantPrefix = (tenant.slug || tenantId)
        .replace(/[^a-z0-9]/gi, '')
        .substring(0, 4)
        .toUpperCase()
        .padStart(4, '0')
        // Convert letters to numbers (A=1, B=2, etc.)
        .split('')
        .map((char: string) => {
          const code = char.charCodeAt(0);
          if (code >= 65 && code <= 90) return ((code - 65) % 10).toString();
          if (code >= 48 && code <= 57) return char;
          return '0';
        })
        .join('');

      barcode = generateEAN13(tenantPrefix, productNumber);
    } else {
      // Default: Generate a simple Code-128 compatible code
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      barcode = `EI-${tenant.slug?.toUpperCase().substring(0, 3) || 'XXX'}-${timestamp}-${random}`;
    }

    // Check if barcode already exists (unlikely but possible)
    const existing = await prisma.productCatalog.findUnique({
      where: { barcode },
    });

    if (existing) {
      // Generate another with random suffix
      barcode = barcode.substring(0, barcode.length - 2) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    }

    return NextResponse.json({
      success: true,
      barcode,
      format,
      message: 'Barcode generated successfully',
    });
  } catch (error: any) {
    console.error('Barcode generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode', message: error.message },
      { status: 500 }
    );
  }
}
