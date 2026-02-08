import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { categories: categoryNames } = body;

    if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
      return NextResponse.json({ error: 'At least one category is required' }, { status: 400 });
    }

    // Filter out existing categories
    const existing = await prisma.category.findMany({
      where: { tenantId },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
    const newCategories = categoryNames.filter(
      (name: string) => name.trim() && !existingNames.has(name.toLowerCase())
    );

    let created = 0;
    if (newCategories.length > 0) {
      const result = await prisma.category.createMany({
        data: newCategories.map((name: string) => ({
          name: name.trim(),
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          tenantId,
        })),
      });
      created = result.count;
    }

    // Update setup progress
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const currentSettings = (tenant?.settings as any) || {};

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...currentSettings,
          setupProgress: {
            ...currentSettings.setupProgress,
            categories: true,
          },
        },
      },
    });

    return NextResponse.json({ message: `Created ${created} categories`, created });
  } catch (error) {
    console.error('[SETUP_CATEGORIES]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
