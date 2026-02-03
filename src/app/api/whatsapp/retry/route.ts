import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RETRY_CONFIG } from '@/lib/whatsapp-service';

// POST /api/whatsapp/retry - Retry a failed message
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
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ message: 'Message ID is required' }, { status: 400 });
    }

    // Find the message
    const message = await prisma.whatsAppMessage.findFirst({
      where: {
        id: messageId,
        tenantId,
      },
    });

    if (!message) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    if (message.status !== 'FAILED' && message.status !== 'RETRY_SCHEDULED') {
      return NextResponse.json({ message: 'Can only retry failed messages' }, { status: 400 });
    }

    if (message.retryCount >= RETRY_CONFIG.maxRetries) {
      return NextResponse.json({ message: 'Maximum retry attempts reached' }, { status: 400 });
    }

    // Schedule retry
    const retryDelay = RETRY_CONFIG.retryDelays[message.retryCount] || RETRY_CONFIG.retryDelays[RETRY_CONFIG.retryDelays.length - 1];
    const nextRetryAt = new Date(Date.now() + retryDelay);

    await prisma.whatsAppMessage.update({
      where: { id: messageId },
      data: {
        status: 'RETRY_SCHEDULED',
        nextRetryAt,
        retryCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      message: 'Retry scheduled',
      nextRetryAt,
      retryCount: message.retryCount + 1,
    });
  } catch (error) {
    console.error('Retry message error:', error);
    return NextResponse.json({ message: 'Failed to schedule retry' }, { status: 500 });
  }
}

// GET /api/whatsapp/retry - Process scheduled retries (for cron job)
export async function GET(request: NextRequest) {
  try {
    // This endpoint can be called by a cron job
    // For security, check for a cron secret
    // const { searchParams } = new URL(request.url);
    // const cronSecret = searchParams.get('secret');
    // if (cronSecret !== process.env.CRON_SECRET) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    // Find messages due for retry
    const messagesToRetry = await prisma.whatsAppMessage.findMany({
      where: {
        status: 'RETRY_SCHEDULED',
        nextRetryAt: { lte: new Date() },
      },
      take: 10, // Process in batches
    });

    const results = [];

    for (const message of messagesToRetry) {
      try {
        // Here you would actually call the WhatsApp API
        // For now, we'll just mark it as pending for manual retry
        await prisma.whatsAppMessage.update({
          where: { id: message.id },
          data: {
            status: 'PENDING',
            nextRetryAt: null,
          },
        });

        results.push({ id: message.id, status: 'queued' });
      } catch (err) {
        results.push({ id: message.id, status: 'error', error: (err as Error).message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Process retries error:', error);
    return NextResponse.json({ message: 'Failed to process retries' }, { status: 500 });
  }
}
