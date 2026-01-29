import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all inventories for tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    // Note: Using categories as inventory locations for now
    // Can be extended to a separate Inventory model if needed
    const categories = await prisma.category.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ inventories: categories });

  } catch (error: any) {
    console.error('INVENTORY_LIST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new inventory/category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!['OWNER', 'ADMIN', 'INVENTORY_MANAGER'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { name, description, slug } = body;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        tenantId,
      }
    });

    return NextResponse.json({
      message: 'Inventory created successfully',
      inventory: category
    }, { status: 201 });

  } catch (error: any) {
    console.error('INVENTORY_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
