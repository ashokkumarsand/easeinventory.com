import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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

    const settings = (tenant?.settings as Record<string, unknown>) || {};
    const schedule = settings.echelonSchedule || {
      enabled: false,
      frequency: 'weekly',
      minServiceLevel: 50,
      maxImbalancePct: 30,
    };

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('[ECHELON_SCHEDULE_GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { enabled, frequency, minServiceLevel, maxImbalancePct } = body;

    if (frequency && !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const existingSettings = (tenant?.settings as Record<string, unknown>) || {};

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...existingSettings,
          echelonSchedule: {
            enabled: enabled ?? false,
            frequency: frequency ?? 'weekly',
            minServiceLevel: minServiceLevel ?? 50,
            maxImbalancePct: maxImbalancePct ?? 30,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ECHELON_SCHEDULE_POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
