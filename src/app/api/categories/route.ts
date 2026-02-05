import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Default categories based on common business types
const DEFAULT_CATEGORIES: Record<string, string[]> = {
  'electronics': [
    'Smartphones',
    'Laptops',
    'Tablets',
    'Wearables',
    'Audio',
    'Cameras',
    'Gaming',
    'Accessories',
    'Cables & Chargers',
    'Storage Devices',
  ],
  'retail': [
    'Clothing',
    'Footwear',
    'Accessories',
    'Home & Living',
    'Beauty',
    'Sports',
    'Toys',
    'Books',
    'Food & Beverages',
    'Health',
  ],
  'pharmacy': [
    'Medicines',
    'OTC Drugs',
    'Healthcare',
    'Personal Care',
    'Baby Care',
    'Supplements',
    'Medical Devices',
    'First Aid',
  ],
  'hardware': [
    'Tools',
    'Plumbing',
    'Electrical',
    'Paint',
    'Building Materials',
    'Fasteners',
    'Safety Equipment',
    'Garden',
  ],
  'general': [
    'General',
    'Electronics',
    'Accessories',
    'Parts',
    'Consumables',
    'Services',
    'Other',
  ],
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    // If no categories exist, return default suggestions
    if (categories.length === 0) {
      // Get tenant's business type to suggest relevant categories
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { businessType: true }
      });

      const businessType = tenant?.businessType?.toLowerCase() || 'general';
      const suggestions = DEFAULT_CATEGORIES[businessType] || DEFAULT_CATEGORIES['general'];

      return NextResponse.json({
        categories: [],
        suggestions: suggestions.map(name => ({ name, suggested: true })),
      });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: {
        tenantId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Category already exists', category: existing }, { status: 409 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
        tenant: { connect: { id: tenantId } },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// Bulk create categories (for initial setup)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { categories: categoryNames } = body;

    if (!Array.isArray(categoryNames)) {
      return NextResponse.json({ error: 'Categories array is required' }, { status: 400 });
    }

    // Get existing categories
    const existing = await prisma.category.findMany({
      where: { tenantId: tenantId },
      select: { name: true },
    });
    const existingNames = new Set(existing.map(c => c.name.toLowerCase()));

    // Filter out duplicates
    const newCategories = categoryNames.filter(
      (name: string) => !existingNames.has(name.toLowerCase())
    );

    if (newCategories.length === 0) {
      return NextResponse.json({ message: 'All categories already exist', created: 0 });
    }

    // Create new categories with slugs
    const result = await prisma.category.createMany({
      data: newCategories.map((name: string) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tenantId: tenantId,
      })),
    });

    return NextResponse.json({
      message: `Created ${result.count} categories`,
      created: result.count,
    });
  } catch (error) {
    console.error('Bulk create categories error:', error);
    return NextResponse.json({ error: 'Failed to create categories' }, { status: 500 });
  }
}
