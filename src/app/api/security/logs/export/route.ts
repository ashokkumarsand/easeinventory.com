import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityAction, SecurityAction } from '@/lib/audit';

// GET /api/security/logs/export - Export security logs as CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only OWNER can export audit logs
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const filterUserId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {
      tenantId,
    };

    if (action) {
      where.action = action;
    }

    if (filterUserId) {
      where.userId = filterUserId;
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

    // Fetch all matching logs (limited to 10000 for performance)
    const logs = await prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    // Fetch user names
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))] as string[];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const userMap = new Map(users.map(u => [u.id, u]));

    // Generate CSV
    const headers = ['Timestamp', 'Action', 'User', 'Resource', 'IP Address', 'Details'];
    const rows = logs.map(log => {
      const user = log.userId ? userMap.get(log.userId) : null;
      const userName = user ? (user.name || user.email) : 'System';
      const details = log.details ? JSON.stringify(log.details) : '';

      return [
        new Date(log.createdAt).toISOString(),
        log.action,
        userName,
        log.resource || '',
        log.ipAddress || '',
        details.replace(/"/g, '""'), // Escape quotes for CSV
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Log the export action
    await logSecurityAction({
      tenantId,
      userId,
      action: SecurityAction.DATA_EXPORT,
      resource: 'SecurityLogs',
      details: { count: logs.length, filters: { action, userId: filterUserId, startDate, endDate } },
    });

    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export security logs error:', error);
    return NextResponse.json({ message: 'Failed to export logs' }, { status: 500 });
  }
}
