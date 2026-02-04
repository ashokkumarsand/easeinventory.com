import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  registerDeviceToken,
  unregisterDeviceToken,
  sendNotification,
} from '@/lib/push-notification';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/notifications - Register device token
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { token, platform, deviceInfo } = body;

    if (!token || !platform) {
      return NextResponse.json({ message: 'Token and platform are required' }, { status: 400 });
    }

    if (!['web', 'ios', 'android'].includes(platform)) {
      return NextResponse.json({ message: 'Invalid platform' }, { status: 400 });
    }

    await registerDeviceToken(userId, token, platform, deviceInfo);

    return NextResponse.json({ message: 'Device token registered successfully' });
  } catch (error) {
    console.error('Register device token error:', error);
    return NextResponse.json({ message: 'Failed to register device token' }, { status: 500 });
  }
}

// DELETE /api/notifications - Unregister device token
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    await unregisterDeviceToken(token);

    return NextResponse.json({ message: 'Device token unregistered successfully' });
  } catch (error) {
    console.error('Unregister device token error:', error);
    return NextResponse.json({ message: 'Failed to unregister device token' }, { status: 500 });
  }
}

// GET /api/notifications - Get user's registered devices
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const devices = await prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        platform: true,
        deviceInfo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json({ message: 'Failed to get devices' }, { status: 500 });
  }
}
