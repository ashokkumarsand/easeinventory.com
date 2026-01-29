import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all locations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const locations = await prisma.location.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { stock: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ locations });

  } catch (error: any) {
    console.error('LOCATIONS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new location
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { name, code, address, city, type, discount } = body;

    if (!name) {
      return NextResponse.json({ message: 'Location name is required' }, { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        name,
        code,
        address,
        city,
        type,
        discount: discount ? Number(discount) : 0,
        tenantId
      }
    });

    return NextResponse.json({
      message: 'Location created successfully',
      location
    }, { status: 201 });

  } catch (error: any) {
    console.error('LOCATION_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
