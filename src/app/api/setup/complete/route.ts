import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
          setupComplete: true,
          setupCompletedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ message: 'Setup complete' });
  } catch (error) {
    console.error('[SETUP_COMPLETE]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
