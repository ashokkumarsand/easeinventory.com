import { prisma } from './prisma';

/**
 * Push Notification Service
 * Supports Firebase Cloud Messaging (FCM) for mobile and web push notifications
 */

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

interface SendNotificationOptions {
  userId?: string;
  userIds?: string[];
  tenantId?: string;
  platform?: 'web' | 'ios' | 'android' | 'all';
}

/**
 * Send push notification via Firebase Cloud Messaging
 */
async function sendFCMNotification(
  tokens: string[],
  payload: NotificationPayload
): Promise<{ success: number; failure: number; failedTokens: string[] }> {
  const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

  if (!FCM_SERVER_KEY) {
    console.warn('FCM_SERVER_KEY not configured. Skipping push notification.');
    return { success: 0, failure: 0, failedTokens: [] };
  }

  if (tokens.length === 0) {
    return { success: 0, failure: 0, failedTokens: [] };
  }

  const results = {
    success: 0,
    failure: 0,
    failedTokens: [] as string[],
  };

  // FCM HTTP v1 API
  // For production, use Firebase Admin SDK
  // This is a simplified implementation using the legacy API

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.imageUrl,
        },
        data: payload.data || {},
      }),
    });

    if (response.ok) {
      const data = await response.json();
      results.success = data.success || 0;
      results.failure = data.failure || 0;

      // Track failed tokens for cleanup
      if (data.results) {
        data.results.forEach((result: any, index: number) => {
          if (result.error) {
            results.failedTokens.push(tokens[index]);
          }
        });
      }
    } else {
      console.error('FCM API error:', response.status, await response.text());
      results.failure = tokens.length;
    }
  } catch (error) {
    console.error('FCM send error:', error);
    results.failure = tokens.length;
  }

  return results;
}

/**
 * Send notification to specific user(s)
 */
export async function sendNotification(
  payload: NotificationPayload,
  options: SendNotificationOptions
): Promise<{ success: number; failure: number }> {
  // Build query for device tokens
  const where: any = { isActive: true };

  if (options.userId) {
    where.userId = options.userId;
  } else if (options.userIds && options.userIds.length > 0) {
    where.userId = { in: options.userIds };
  } else if (options.tenantId) {
    // Get all users in tenant
    const users = await prisma.user.findMany({
      where: { tenantId: options.tenantId },
      select: { id: true },
    });
    where.userId = { in: users.map(u => u.id) };
  }

  if (options.platform && options.platform !== 'all') {
    where.platform = options.platform;
  }

  // Fetch tokens
  const deviceTokens = await prisma.deviceToken.findMany({
    where,
    select: { token: true },
  });

  const tokens = deviceTokens.map(dt => dt.token);

  if (tokens.length === 0) {
    return { success: 0, failure: 0 };
  }

  // Send in batches of 500 (FCM limit)
  const BATCH_SIZE = 500;
  let totalSuccess = 0;
  let totalFailure = 0;
  const allFailedTokens: string[] = [];

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    const result = await sendFCMNotification(batch, payload);
    totalSuccess += result.success;
    totalFailure += result.failure;
    allFailedTokens.push(...result.failedTokens);
  }

  // Mark failed tokens as inactive
  if (allFailedTokens.length > 0) {
    await prisma.deviceToken.updateMany({
      where: { token: { in: allFailedTokens } },
      data: { isActive: false },
    });
  }

  return { success: totalSuccess, failure: totalFailure };
}

/**
 * Register device token for push notifications
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: 'web' | 'ios' | 'android',
  deviceInfo?: any
): Promise<void> {
  // Upsert token (update if exists, create if not)
  await prisma.deviceToken.upsert({
    where: { token },
    update: {
      userId,
      platform,
      deviceInfo,
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      token,
      platform,
      deviceInfo,
      isActive: true,
    },
  });
}

/**
 * Unregister device token
 */
export async function unregisterDeviceToken(token: string): Promise<void> {
  await prisma.deviceToken.updateMany({
    where: { token },
    data: { isActive: false },
  });
}

// ==================== NOTIFICATION TEMPLATES ====================

export const NotificationTemplates = {
  // Repair notifications
  repairReceived: (ticketNumber: string) => ({
    title: 'Repair Received',
    body: `Your repair #${ticketNumber} has been received and logged.`,
    data: { type: 'REPAIR_RECEIVED', ticketNumber },
  }),

  repairStatusUpdate: (ticketNumber: string, status: string) => ({
    title: 'Repair Status Update',
    body: `Your repair #${ticketNumber} is now ${status.toLowerCase().replace('_', ' ')}.`,
    data: { type: 'REPAIR_STATUS', ticketNumber, status },
  }),

  repairReady: (ticketNumber: string) => ({
    title: 'Repair Complete',
    body: `Your repair #${ticketNumber} is ready for pickup!`,
    data: { type: 'REPAIR_READY', ticketNumber },
  }),

  // Invoice notifications
  invoiceCreated: (invoiceNumber: string, amount: string) => ({
    title: 'New Invoice',
    body: `Invoice ${invoiceNumber} for ₹${amount} has been created.`,
    data: { type: 'INVOICE_CREATED', invoiceNumber },
  }),

  paymentReceived: (invoiceNumber: string, amount: string) => ({
    title: 'Payment Received',
    body: `Payment of ₹${amount} received for invoice ${invoiceNumber}.`,
    data: { type: 'PAYMENT_RECEIVED', invoiceNumber },
  }),

  paymentReminder: (invoiceNumber: string, amount: string, daysOverdue: number) => ({
    title: 'Payment Reminder',
    body: `Invoice ${invoiceNumber} for ₹${amount} is ${daysOverdue} days overdue.`,
    data: { type: 'PAYMENT_REMINDER', invoiceNumber },
  }),

  // Stock notifications
  lowStock: (productName: string, quantity: number) => ({
    title: 'Low Stock Alert',
    body: `${productName} is running low (${quantity} remaining).`,
    data: { type: 'LOW_STOCK', productName },
  }),

  // Leave notifications
  leaveApproved: (leaveType: string, dates: string) => ({
    title: 'Leave Approved',
    body: `Your ${leaveType} leave for ${dates} has been approved.`,
    data: { type: 'LEAVE_APPROVED', leaveType },
  }),

  leaveRejected: (leaveType: string, dates: string) => ({
    title: 'Leave Rejected',
    body: `Your ${leaveType} leave request for ${dates} has been rejected.`,
    data: { type: 'LEAVE_REJECTED', leaveType },
  }),

  // Attendance
  attendanceReminder: () => ({
    title: 'Attendance Reminder',
    body: "Don't forget to punch in for today!",
    data: { type: 'ATTENDANCE_REMINDER' },
  }),
};
