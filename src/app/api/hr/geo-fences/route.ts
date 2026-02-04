import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/hr/geo-fences - List all geo-fences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const geoFences = await prisma.geoFence.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ geoFences });
  } catch (error) {
    console.error('Fetch geo-fences error:', error);
    return NextResponse.json({ message: 'Failed to fetch geo-fences' }, { status: 500 });
  }
}

// POST /api/hr/geo-fences - Create geo-fence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only OWNER and MANAGER can create geo-fences
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, latitude, longitude, radius, isActive, isDefault } = body;

    // Validation
    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Name, latitude, and longitude are required' }, { status: 400 });
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await prisma.geoFence.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const geoFence = await prisma.geoFence.create({
      data: {
        name,
        description,
        latitude,
        longitude,
        radius: radius || 100,
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        tenantId,
      },
    });

    return NextResponse.json({ geoFence }, { status: 201 });
  } catch (error) {
    console.error('Create geo-fence error:', error);
    return NextResponse.json({ message: 'Failed to create geo-fence' }, { status: 500 });
  }
}

// PATCH /api/hr/geo-fences - Update geo-fence
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, latitude, longitude, radius, isActive, isDefault } = body;

    if (!id) {
      return NextResponse.json({ message: 'Geo-fence ID is required' }, { status: 400 });
    }

    // Verify geo-fence exists and belongs to tenant
    const existing = await prisma.geoFence.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Geo-fence not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults first
    if (isDefault && !existing.isDefault) {
      await prisma.geoFence.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (radius !== undefined) updateData.radius = radius;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const geoFence = await prisma.geoFence.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ geoFence });
  } catch (error) {
    console.error('Update geo-fence error:', error);
    return NextResponse.json({ message: 'Failed to update geo-fence' }, { status: 500 });
  }
}

// DELETE /api/hr/geo-fences - Delete geo-fence
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['OWNER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Geo-fence ID is required' }, { status: 400 });
    }

    // Verify geo-fence exists and belongs to tenant
    const existing = await prisma.geoFence.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Geo-fence not found' }, { status: 404 });
    }

    await prisma.geoFence.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Geo-fence deleted successfully' });
  } catch (error) {
    console.error('Delete geo-fence error:', error);
    return NextResponse.json({ message: 'Failed to delete geo-fence' }, { status: 500 });
  }
}
