import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get tenant settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
        logo: true,
        primaryColor: true,
        gstNumber: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
      }
    });

    return NextResponse.json({ tenant });

  } catch (error: any) {
    console.error('TENANT_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// PATCH - Update tenant settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;

    if (role !== 'OWNER' && role !== 'ADMIN') {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { customDomain, name, gstNumber, address, city, state, pincode } = body;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(customDomain !== undefined && { customDomain: customDomain || null }),
        ...(name && { name }),
        ...(gstNumber !== undefined && { gstNumber }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
      }
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      tenant: updated
    });

  } catch (error: any) {
    console.error('TENANT_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
