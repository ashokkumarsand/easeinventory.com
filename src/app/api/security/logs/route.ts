import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/security/logs - Fetch security logs with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only OWNER and MANAGER can view audit logs
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId,
    };

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Fetch logs with pagination
    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          tenant: {
            select: { name: true },
          },
        },
      }),
      prisma.securityLog.count({ where }),
    ]);

    // Fetch user names for logs with userId
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))] as string[];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const userMap = new Map(users.map(u => [u.id, u]));

    // Get distinct actions for filter dropdown
    const distinctActions = await prisma.securityLog.findMany({
      where: { tenantId },
      select: { action: true },
      distinct: ['action'],
    });

    // Get distinct users for filter dropdown
    const distinctUserIds = await prisma.securityLog.findMany({
      where: { tenantId, userId: { not: null } },
      select: { userId: true },
      distinct: ['userId'],
    });

    const filterUsers = distinctUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: distinctUserIds.map(d => d.userId!).filter(Boolean) } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const logsWithUserInfo = logs.map(log => ({
      ...log,
      userName: log.userId ? userMap.get(log.userId)?.name || userMap.get(log.userId)?.email : 'System',
    }));

    return NextResponse.json({
      logs: logsWithUserInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        actions: distinctActions.map(d => d.action),
        users: filterUsers,
      },
    });
  } catch (error) {
    console.error('Fetch security logs error:', error);
    return NextResponse.json({ message: 'Failed to fetch logs' }, { status: 500 });
  }
}
