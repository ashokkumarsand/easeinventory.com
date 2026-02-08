import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        businessType: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        phone: true,
        email: true,
        settings: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const settings = (tenant.settings as any) || {};

    return NextResponse.json({
      tenantName: tenant.name,
      businessType: tenant.businessType,
      setupComplete: settings.setupComplete ?? true,
      setupProgress: settings.setupProgress || {},
      hasAddress: !!(tenant.address && tenant.city && tenant.state),
      hasPhone: !!tenant.phone,
    });
  } catch (error) {
    console.error('[SETUP_STATUS_GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
