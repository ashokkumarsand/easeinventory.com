import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/whatsapp/opt-in - Check opt-in status or list opt-ins
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

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (phone) {
      // Check specific phone opt-in status
      const optIn = await prisma.whatsAppOptIn.findUnique({
        where: {
          phone_tenantId: {
            phone,
            tenantId,
          },
        },
      });

      return NextResponse.json({
        phone,
        optedIn: optIn?.optedIn ?? false, // If no record, not opted in
        optInAt: optIn?.optInAt,
        optOutAt: optIn?.optOutAt,
      });
    }

    // List all opt-ins
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [optIns, total] = await Promise.all([
      prisma.whatsAppOptIn.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.whatsAppOptIn.count({
        where: { tenantId },
      }),
    ]);

    const optedInCount = await prisma.whatsAppOptIn.count({
      where: { tenantId, optedIn: true },
    });

    return NextResponse.json({
      optIns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        optedIn: optedInCount,
        optedOut: total - optedInCount,
      },
    });
  } catch (error) {
    console.error('Fetch opt-in error:', error);
    return NextResponse.json({ message: 'Failed to fetch opt-in data' }, { status: 500 });
  }
}

// POST /api/whatsapp/opt-in - Record opt-in
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, source } = body;

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, '').replace(/^0+/, '');

    const optIn = await prisma.whatsAppOptIn.upsert({
      where: {
        phone_tenantId: {
          phone: normalizedPhone,
          tenantId,
        },
      },
      update: {
        optedIn: true,
        optInAt: new Date(),
        optOutAt: null,
        source: source || 'manual',
      },
      create: {
        phone: normalizedPhone,
        tenantId,
        optedIn: true,
        optInAt: new Date(),
        source: source || 'manual',
      },
    });

    return NextResponse.json({
      message: 'Opt-in recorded successfully',
      optIn,
    });
  } catch (error) {
    console.error('Record opt-in error:', error);
    return NextResponse.json({ message: 'Failed to record opt-in' }, { status: 500 });
  }
}

// DELETE /api/whatsapp/opt-in - Record opt-out
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/\s+/g, '').replace(/^0+/, '');

    try {
      const optIn = await prisma.whatsAppOptIn.update({
        where: {
          phone_tenantId: {
            phone: normalizedPhone,
            tenantId,
          },
        },
        data: {
          optedIn: false,
          optOutAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Opt-out recorded successfully',
        optIn,
      });
    } catch (updateError: any) {
      if (updateError.code === 'P2025') {
        // Record not found - create as opted-out
        const optIn = await prisma.whatsAppOptIn.create({
          data: {
            phone: normalizedPhone,
            tenantId,
            optedIn: false,
            optInAt: new Date(),
            optOutAt: new Date(),
            source: 'opt-out-request',
          },
        });

        return NextResponse.json({
          message: 'Opt-out recorded successfully',
          optIn,
        });
      }
      throw updateError;
    }
  } catch (error) {
    console.error('Record opt-out error:', error);
    return NextResponse.json({ message: 'Failed to record opt-out' }, { status: 500 });
  }
}
