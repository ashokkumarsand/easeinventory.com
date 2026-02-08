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
    const { name, address, city, state, pincode } = body;

    if (!name) {
      return NextResponse.json({ error: 'Warehouse name is required' }, { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        name,
        code: 'WH-01',
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        type: 'WAREHOUSE',
        tenantId,
      },
    });

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
            warehouse: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Warehouse created', location }, { status: 201 });
  } catch (error) {
    console.error('[SETUP_LOCATION]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
