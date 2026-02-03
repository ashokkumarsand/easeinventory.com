import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/whatsapp/messages - Fetch message history
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
    const status = searchParams.get('status');
    const direction = searchParams.get('direction');
    const referenceType = searchParams.get('referenceType');
    const referenceId = searchParams.get('referenceId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (phone) where.phone = phone;
    if (status) where.status = status;
    if (direction) where.direction = direction;
    if (referenceType) where.referenceType = referenceType;
    if (referenceId) where.referenceId = referenceId;

    const [messages, total] = await Promise.all([
      prisma.whatsAppMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.whatsAppMessage.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.whatsAppMessage.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    });

    const statsMap = stats.reduce((acc, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Get monthly cost
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyCost = await prisma.whatsAppMessage.aggregate({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
        status: { in: ['SENT', 'DELIVERED', 'READ'] },
      },
      _sum: { costPaise: true },
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pending: statsMap.PENDING || 0,
        sent: statsMap.SENT || 0,
        delivered: statsMap.DELIVERED || 0,
        read: statsMap.READ || 0,
        failed: statsMap.FAILED || 0,
        retryScheduled: statsMap.RETRY_SCHEDULED || 0,
        monthlyCostPaise: monthlyCost._sum.costPaise || 0,
      },
    });
  } catch (error) {
    console.error('Fetch WhatsApp messages error:', error);
    return NextResponse.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}
