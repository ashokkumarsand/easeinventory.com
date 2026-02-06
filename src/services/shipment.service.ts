import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import type { CarrierAdapter, CreateShipmentOrderParams } from '@/lib/carriers/carrier-adapter';
import { MockCarrierAdapter } from '@/lib/carriers/mock-carrier-adapter';
import { ShiprocketAdapter } from '@/lib/carriers/shiprocket-adapter';
import type { CarrierProvider } from '@prisma/client';

/**
 * Get the appropriate carrier adapter and cached token for a carrier account
 */
async function getCarrierContext(carrierAccountId: string) {
  const account = await prisma.carrierAccount.findUnique({
    where: { id: carrierAccountId },
  });
  if (!account) throw new Error('Carrier account not found');

  let adapter: CarrierAdapter;
  switch (account.provider) {
    case 'SHIPROCKET':
      adapter = new ShiprocketAdapter();
      break;
    case 'DELHIVERY':
      // TODO: Phase 3 — Delhivery adapter
      adapter = new MockCarrierAdapter();
      break;
    default:
      adapter = new MockCarrierAdapter();
  }

  // Check token freshness
  let token = account.apiToken || '';
  if (!token || (account.tokenExpiresAt && account.tokenExpiresAt < new Date())) {
    // Re-authenticate
    const auth = await adapter.authenticate(account.apiKey || '', account.apiSecret || '');
    token = auth.token;

    await prisma.carrierAccount.update({
      where: { id: carrierAccountId },
      data: { apiToken: auth.token, tokenExpiresAt: auth.expiresAt },
    });
  }

  return { adapter, token, account };
}

export class ShipmentService {
  /**
   * Create a shipment for an order and push to carrier
   */
  static async create(
    orderId: string,
    tenantId: string,
    carrierAccountId: string,
    courierCompanyId?: number,
  ) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true, customer: true },
    });
    if (!order) throw new Error('Order not found');
    if (!['CONFIRMED', 'PROCESSING'].includes(order.status)) {
      throw new Error('Order must be confirmed before shipping');
    }

    const { adapter, token, account } = await getCarrierContext(carrierAccountId);
    const shipmentNumber = await generateNumber('SHP', tenantId);

    // Build carrier order params
    const params: CreateShipmentOrderParams = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toISOString().split('T')[0],
      billingName: order.billingName || order.shippingName,
      billingPhone: order.billingPhone || order.shippingPhone,
      billingAddress: order.billingAddress || order.shippingAddress,
      billingCity: order.billingCity || order.shippingCity,
      billingState: order.billingState || order.shippingState,
      billingPincode: order.billingPincode || order.shippingPincode,
      billingEmail: order.shippingEmail || undefined,
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPincode: order.shippingPincode,
      paymentMethod: order.isCOD ? 'COD' : 'Prepaid',
      subTotal: Number(order.total),
      codAmount: order.isCOD ? Number(order.codAmount || order.total) : undefined,
      weightGrams: order.weightGrams || 500,
      lengthCm: order.lengthCm || 20,
      breadthCm: order.breadthCm || 15,
      heightCm: order.heightCm || 10,
      pickupLocationId: account.pickupLocationName || undefined,
      items: order.items.map((item) => ({
        name: item.productName,
        sku: item.sku || 'N/A',
        units: item.quantity,
        sellingPrice: Number(item.unitPrice),
        hsnCode: item.hsnCode || undefined,
      })),
    };

    // Push to carrier
    const carrierRes = await adapter.createOrder(params, token);
    if (!carrierRes.success) {
      throw new Error(`Carrier error: ${carrierRes.error}`);
    }

    // Create shipment in DB
    const shipment = await prisma.$transaction(async (tx) => {
      const s = await tx.shipment.create({
        data: {
          shipmentNumber,
          orderId,
          carrierAccountId,
          carrierOrderId: carrierRes.carrierOrderId,
          weightGrams: order.weightGrams,
          lengthCm: order.lengthCm,
          breadthCm: order.breadthCm,
          heightCm: order.heightCm,
          codAmount: order.isCOD ? order.codAmount || order.total : undefined,
          tenantId,
          trackingEvents: {
            create: {
              status: 'Shipment Created',
              statusCode: 'CREATED',
              description: `Order pushed to ${account.provider}`,
              eventAt: new Date(),
            },
          },
        },
        include: { trackingEvents: true },
      });

      // Update order status
      await tx.salesOrder.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      });

      return s;
    });

    // Try to assign AWB immediately
    if (carrierRes.shipmentId || carrierRes.carrierOrderId) {
      try {
        const awbRes = await adapter.assignAWB(
          carrierRes.shipmentId || carrierRes.carrierOrderId!,
          courierCompanyId,
          token,
        );
        if (awbRes.success && awbRes.awbNumber) {
          await prisma.shipment.update({
            where: { id: shipment.id },
            data: {
              awbNumber: awbRes.awbNumber,
              courierCompanyId: awbRes.courierCompanyId,
              carrierName: awbRes.courierName,
            },
          });
        }
      } catch (e) {
        console.error('AWB_ASSIGN_ERROR:', e);
        // Non-fatal — AWB can be assigned later
      }
    }

    return shipment;
  }

  /**
   * Assign AWB to an existing shipment
   */
  static async assignAWB(shipmentId: string, tenantId: string, courierCompanyId?: number) {
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) throw new Error('Shipment not found');
    if (shipment.awbNumber) throw new Error('AWB already assigned');
    if (!shipment.carrierAccountId) throw new Error('No carrier account linked');

    const { adapter, token } = await getCarrierContext(shipment.carrierAccountId);

    const res = await adapter.assignAWB(
      shipment.carrierOrderId || shipment.id,
      courierCompanyId,
      token,
    );
    if (!res.success) throw new Error(`AWB assignment failed: ${res.error}`);

    return prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        awbNumber: res.awbNumber,
        courierCompanyId: res.courierCompanyId,
        carrierName: res.courierName,
      },
    });
  }

  /**
   * Generate shipping label
   */
  static async generateLabel(shipmentId: string, tenantId: string) {
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) throw new Error('Shipment not found');
    if (!shipment.carrierAccountId) throw new Error('No carrier account linked');

    const { adapter, token } = await getCarrierContext(shipment.carrierAccountId);

    const res = await adapter.generateLabel(
      shipment.carrierOrderId || shipment.id,
      token,
    );
    if (!res.success) throw new Error(`Label generation failed: ${res.error}`);

    return prisma.shipment.update({
      where: { id: shipmentId },
      data: { labelUrl: res.labelUrl },
    });
  }

  /**
   * Schedule carrier pickup
   */
  static async schedulePickup(shipmentId: string, tenantId: string, pickupDate: string) {
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) throw new Error('Shipment not found');
    if (!shipment.carrierAccountId) throw new Error('No carrier account linked');

    const { adapter, token } = await getCarrierContext(shipment.carrierAccountId);

    const res = await adapter.schedulePickup(
      shipment.carrierOrderId || shipment.id,
      pickupDate,
      token,
    );
    if (!res.success) throw new Error(`Pickup scheduling failed: ${res.error}`);

    return prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'PICKUP_SCHEDULED' },
    });
  }

  /**
   * Fetch tracking from carrier and update DB
   */
  static async syncTracking(shipmentId: string, tenantId: string) {
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) throw new Error('Shipment not found');
    if (!shipment.awbNumber) throw new Error('No AWB assigned');
    if (!shipment.carrierAccountId) throw new Error('No carrier account linked');

    const { adapter, token } = await getCarrierContext(shipment.carrierAccountId);

    const tracking = await adapter.getTracking(shipment.awbNumber, token);
    if (!tracking.success) throw new Error(`Tracking fetch failed: ${tracking.error}`);

    // Upsert tracking events
    for (const event of tracking.events) {
      const existing = await prisma.shipmentTracking.findFirst({
        where: {
          shipmentId: shipment.id,
          status: event.status,
          eventAt: new Date(event.timestamp),
        },
      });
      if (!existing) {
        await prisma.shipmentTracking.create({
          data: {
            shipmentId: shipment.id,
            status: event.status,
            statusCode: event.statusCode,
            description: event.description,
            location: event.location,
            city: event.city,
            rawPayload: event.rawPayload ? (event.rawPayload as any) : undefined,
            eventAt: new Date(event.timestamp),
          },
        });
      }
    }

    // Map carrier status to our ShipmentStatus
    const statusMap: Record<string, string> = {
      '1': 'CREATED',
      '2': 'PICKUP_SCHEDULED',
      '6': 'PICKED_UP',
      '17': 'IN_TRANSIT',
      '18': 'IN_TRANSIT',
      '7': 'DELIVERED',
      '8': 'CANCELLED',
      '9': 'RTO_INITIATED',
      '10': 'RTO_DELIVERED',
      '19': 'OUT_FOR_DELIVERY',
      '12': 'LOST',
    };

    const mappedStatus = tracking.currentStatusCode
      ? statusMap[tracking.currentStatusCode]
      : undefined;

    if (mappedStatus) {
      const updateData: any = {
        status: mappedStatus,
        currentEvent: tracking.currentStatus,
      };

      // Set timestamp fields based on status
      if (mappedStatus === 'PICKED_UP' && !shipment.pickedUpAt) {
        updateData.pickedUpAt = new Date();
      }
      if (mappedStatus === 'IN_TRANSIT' && !shipment.inTransitAt) {
        updateData.inTransitAt = new Date();
      }
      if (mappedStatus === 'OUT_FOR_DELIVERY' && !shipment.outForDeliveryAt) {
        updateData.outForDeliveryAt = new Date();
      }
      if (mappedStatus === 'DELIVERED' && !shipment.deliveredAt) {
        updateData.deliveredAt = new Date();
      }

      await prisma.shipment.update({
        where: { id: shipment.id },
        data: updateData,
      });

      // Update order status
      if (mappedStatus === 'DELIVERED') {
        await prisma.salesOrder.update({
          where: { id: shipment.orderId },
          data: {
            status: 'DELIVERED',
            fulfillmentStatus: 'FULFILLED',
          },
        });
      } else if (['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(mappedStatus)) {
        await prisma.salesOrder.update({
          where: { id: shipment.orderId },
          data: { status: 'SHIPPED' },
        });
      }
    }

    return prisma.shipment.findFirst({
      where: { id: shipment.id },
      include: { trackingEvents: { orderBy: { eventAt: 'desc' } } },
    });
  }

  /**
   * Process webhook status update from carrier
   */
  static async processWebhook(payload: any) {
    const awb = payload.awb || payload.awb_number;
    if (!awb) {
      console.error('WEBHOOK_MISSING_AWB:', payload);
      return;
    }

    const shipment = await prisma.shipment.findFirst({
      where: { awbNumber: awb },
    });
    if (!shipment) {
      console.error('WEBHOOK_SHIPMENT_NOT_FOUND:', awb);
      return;
    }

    // Create tracking event
    await prisma.shipmentTracking.create({
      data: {
        shipmentId: shipment.id,
        status: payload.current_status || payload.status || 'Unknown',
        statusCode: String(payload.current_status_id || ''),
        description: payload.shipment_status || payload.description || '',
        location: payload.scans?.[0]?.location || '',
        city: payload.scans?.[0]?.city_name || '',
        rawPayload: payload,
        eventAt: new Date(payload.etd || payload.timestamp || Date.now()),
      },
    });

    // Map to our status
    const statusId = String(payload.current_status_id || '');
    const statusMap: Record<string, string> = {
      '1': 'CREATED',
      '2': 'PICKUP_SCHEDULED',
      '6': 'PICKED_UP',
      '17': 'IN_TRANSIT',
      '18': 'IN_TRANSIT',
      '7': 'DELIVERED',
      '8': 'CANCELLED',
      '9': 'RTO_INITIATED',
      '10': 'RTO_DELIVERED',
      '19': 'OUT_FOR_DELIVERY',
      '12': 'LOST',
      '21': 'OUT_FOR_DELIVERY', // NDR
    };

    const mappedStatus = statusMap[statusId];
    if (mappedStatus) {
      const updateData: any = {
        status: mappedStatus,
        currentEvent: payload.current_status,
      };

      if (mappedStatus === 'DELIVERED') updateData.deliveredAt = new Date();
      if (mappedStatus === 'PICKED_UP') updateData.pickedUpAt = new Date();
      if (mappedStatus === 'IN_TRANSIT') updateData.inTransitAt = new Date();
      if (mappedStatus === 'OUT_FOR_DELIVERY') updateData.outForDeliveryAt = new Date();

      await prisma.shipment.update({
        where: { id: shipment.id },
        data: updateData,
      });

      // Update order status
      if (mappedStatus === 'DELIVERED') {
        await prisma.salesOrder.update({
          where: { id: shipment.orderId },
          data: { status: 'DELIVERED', fulfillmentStatus: 'FULFILLED' },
        });
      } else if (['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(mappedStatus)) {
        await prisma.salesOrder.update({
          where: { id: shipment.orderId },
          data: { status: 'SHIPPED' },
        });
      }
    }

    // Handle NDR
    if (statusId === '21' || statusId === '22') {
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          ndrStatus: 'ACTION_REQUIRED',
          ndrReason: payload.ndr_reason || payload.shipment_status || 'Delivery failed',
          ndrAttempts: { increment: 1 },
        },
      });
    }
  }

  /**
   * Get shipment by ID
   */
  static async getById(id: string, tenantId: string) {
    return prisma.shipment.findFirst({
      where: { id, tenantId },
      include: {
        order: { include: { customer: true, items: true } },
        carrierAccount: true,
        trackingEvents: { orderBy: { eventAt: 'desc' } },
      },
    });
  }

  /**
   * List shipments with filtering
   */
  static async list(
    tenantId: string,
    filter: { status?: string; search?: string; ndrOnly?: boolean } = {},
    page = 1,
    pageSize = 50,
  ) {
    const where: any = { tenantId };

    if (filter.status) where.status = filter.status;
    if (filter.ndrOnly) where.ndrStatus = 'ACTION_REQUIRED';
    if (filter.search) {
      where.OR = [
        { shipmentNumber: { contains: filter.search, mode: 'insensitive' } },
        { awbNumber: { contains: filter.search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          order: { select: { orderNumber: true, shippingName: true, shippingCity: true, total: true } },
          carrierAccount: { select: { provider: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.shipment.count({ where }),
    ]);

    return { shipments, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Check pincode serviceability
   */
  static async checkServiceability(
    carrierAccountId: string,
    pickupPincode: string,
    deliveryPincode: string,
    weightGrams: number,
    isCOD: boolean,
  ) {
    const { adapter, token } = await getCarrierContext(carrierAccountId);
    return adapter.checkServiceability(
      { pickupPincode, deliveryPincode, weightGrams, isCOD },
      token,
    );
  }

  /**
   * Cancel a shipment
   */
  static async cancel(shipmentId: string, tenantId: string) {
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) throw new Error('Shipment not found');
    if (['DELIVERED', 'RTO_DELIVERED', 'LOST'].includes(shipment.status)) {
      throw new Error('Cannot cancel completed shipment');
    }

    if (shipment.carrierAccountId && shipment.carrierOrderId) {
      const { adapter, token } = await getCarrierContext(shipment.carrierAccountId);
      const res = await adapter.cancelShipment(shipment.carrierOrderId, token);
      if (!res.success) throw new Error(`Carrier cancel failed: ${res.error}`);
    }

    return prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Get COD pending summary
   */
  static async getCODPending(tenantId: string) {
    const pendingShipments = await prisma.shipment.findMany({
      where: {
        tenantId,
        codAmount: { not: null },
        codCollected: false,
        status: 'DELIVERED',
      },
      include: {
        order: { select: { orderNumber: true, shippingName: true } },
      },
      orderBy: { deliveredAt: 'asc' },
    });

    const totalPending = pendingShipments.reduce(
      (sum, s) => sum + Number(s.codAmount || 0),
      0,
    );

    return {
      shipments: pendingShipments,
      totalPending,
      count: pendingShipments.length,
    };
  }

  /**
   * Get COD remittance history
   */
  static async getCODRemittances(tenantId: string, page = 1, pageSize = 20) {
    const [remittances, total] = await Promise.all([
      prisma.cODRemittance.findMany({
        where: { tenantId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.cODRemittance.count({ where: { tenantId } }),
    ]);

    return { remittances, total, page, pageSize };
  }
}
