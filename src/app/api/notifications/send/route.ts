import { authOptions } from '@/lib/auth';
import { sendNotification } from '@/lib/push-notification';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/notifications/send - Send push notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only OWNER, MANAGER, or SUPER_ADMIN can send notifications
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, targetUserId, targetUserIds, platform, testMode } = body;

    if (!title || !message) {
      return NextResponse.json({ message: 'Title and message are required' }, { status: 400 });
    }

    // Build notification payload
    const payload = {
      title,
      body: message,
      data: {
        type: 'CUSTOM',
        sentBy: userId,
        timestamp: new Date().toISOString(),
      },
    };

    // Determine target
    let options: any = {};

    if (testMode) {
      // Test mode - send to self
      options.userId = userId;
    } else if (targetUserId) {
      // Single user
      options.userId = targetUserId;
    } else if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      // Multiple users
      options.userIds = targetUserIds;
    } else {
      // All users in tenant
      options.tenantId = tenantId;
    }

    if (platform && platform !== 'all') {
      options.platform = platform;
    }

    const result = await sendNotification(payload, options);

    return NextResponse.json({
      message: `Notification sent`,
      result: {
        success: result.success,
        failure: result.failure,
        total: result.success + result.failure,
      },
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json({ message: 'Failed to send notification' }, { status: 500 });
  }
}
