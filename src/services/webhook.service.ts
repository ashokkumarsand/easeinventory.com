import crypto from 'crypto';
import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export interface CreateWebhookInput {
  url: string;
  secret?: string;
  events: string[];
  createdById: string;
  tenantId: string;
}

export interface UpdateWebhookInput {
  url?: string;
  events?: string[];
  isActive?: boolean;
}

// ============================================================
// Available events
// ============================================================

export const WEBHOOK_EVENTS = [
  'order.created',
  'order.shipped',
  'shipment.delivered',
  'stock.low',
  'payment.received',
  'return.created',
  'po.received',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

// ============================================================
// Service
// ============================================================

export class WebhookService {
  /**
   * List all webhook endpoints for a tenant
   */
  static async list(tenantId: string) {
    return prisma.webhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { deliveries: true } },
      },
    });
  }

  /**
   * Get a single endpoint with recent deliveries
   */
  static async getById(id: string, tenantId: string) {
    return prisma.webhookEndpoint.findFirst({
      where: { id, tenantId },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  /**
   * Create a new webhook endpoint
   */
  static async create(data: CreateWebhookInput) {
    const secret = data.secret || crypto.randomBytes(32).toString('hex');

    return prisma.webhookEndpoint.create({
      data: {
        url: data.url,
        secret,
        events: data.events,
        createdById: data.createdById,
        tenantId: data.tenantId,
      },
    });
  }

  /**
   * Update a webhook endpoint
   */
  static async update(id: string, tenantId: string, data: UpdateWebhookInput) {
    // Verify ownership
    const existing = await prisma.webhookEndpoint.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new Error('Webhook endpoint not found');

    return prisma.webhookEndpoint.update({
      where: { id },
      data: {
        ...(data.url !== undefined && { url: data.url }),
        ...(data.events !== undefined && { events: data.events }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  /**
   * Delete a webhook endpoint
   */
  static async delete(id: string, tenantId: string) {
    const existing = await prisma.webhookEndpoint.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new Error('Webhook endpoint not found');

    return prisma.webhookEndpoint.delete({ where: { id } });
  }

  /**
   * Deliver a webhook event to all active subscribers
   */
  static async deliver(tenantId: string, event: string, payload: Record<string, unknown>) {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        tenantId,
        isActive: true,
        events: { has: event },
      },
    });

    for (const endpoint of endpoints) {
      try {
        const body = JSON.stringify(payload);

        // Create HMAC-SHA256 signature
        const signature = crypto
          .createHmac('sha256', endpoint.secret)
          .update(body)
          .digest('hex');

        // Make HTTP POST request
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        const responseBody = await response.text().catch(() => '');
        const success = response.status >= 200 && response.status < 300;

        // Record delivery
        await prisma.webhookDelivery.create({
          data: {
            endpointId: endpoint.id,
            event,
            payload: payload as any,
            statusCode: response.status,
            responseBody: responseBody.slice(0, 2000),
            success,
            deliveredAt: new Date(),
            tenantId,
          },
        });

        if (success) {
          // Reset fail count on success
          await prisma.webhookEndpoint.update({
            where: { id: endpoint.id },
            data: {
              failCount: 0,
              lastDeliveredAt: new Date(),
            },
          });
        } else {
          // Increment fail count
          const updated = await prisma.webhookEndpoint.update({
            where: { id: endpoint.id },
            data: {
              failCount: { increment: 1 },
            },
          });

          // Deactivate if too many failures
          if (updated.failCount >= 10) {
            await prisma.webhookEndpoint.update({
              where: { id: endpoint.id },
              data: { isActive: false },
            });
          }
        }
      } catch (error) {
        // Record failed delivery attempt
        try {
          await prisma.webhookDelivery.create({
            data: {
              endpointId: endpoint.id,
              event,
              payload: payload as any,
              statusCode: null,
              responseBody: error instanceof Error ? error.message : 'Unknown error',
              success: false,
              deliveredAt: new Date(),
              tenantId,
            },
          });

          const updated = await prisma.webhookEndpoint.update({
            where: { id: endpoint.id },
            data: {
              failCount: { increment: 1 },
            },
          });

          if (updated.failCount >= 10) {
            await prisma.webhookEndpoint.update({
              where: { id: endpoint.id },
              data: { isActive: false },
            });
          }
        } catch {
          // Swallow inner error to avoid propagation
        }
      }
    }
  }

  /**
   * Send a test event to a specific endpoint
   */
  static async testEndpoint(id: string, tenantId: string) {
    const endpoint = await prisma.webhookEndpoint.findFirst({
      where: { id, tenantId },
    });
    if (!endpoint) throw new Error('Webhook endpoint not found');

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery from EaseInventory',
        endpointId: endpoint.id,
      },
    };

    const body = JSON.stringify(testPayload);
    const signature = crypto
      .createHmac('sha256', endpoint.secret)
      .update(body)
      .digest('hex');

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'test',
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      const responseBody = await response.text().catch(() => '');
      const success = response.status >= 200 && response.status < 300;

      // Record the test delivery
      const delivery = await prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event: 'test',
          payload: testPayload as any,
          statusCode: response.status,
          responseBody: responseBody.slice(0, 2000),
          success,
          deliveredAt: new Date(),
          tenantId,
        },
      });

      return { success, statusCode: response.status, deliveryId: delivery.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event: 'test',
          payload: testPayload as any,
          statusCode: null,
          responseBody: errorMessage,
          success: false,
          deliveredAt: new Date(),
          tenantId,
        },
      });

      return { success: false, statusCode: null, error: errorMessage };
    }
  }
}
