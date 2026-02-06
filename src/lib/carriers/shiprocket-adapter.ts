/**
 * Shiprocket Carrier Adapter
 * REST API integration with token-based auth (10-day expiry).
 *
 * API docs: https://apidocs.shiprocket.in/
 */

import type {
  CarrierAdapter,
  CreateShipmentOrderParams,
  CarrierOrderResponse,
  AWBResponse,
  LabelResponse,
  PickupResponse,
  TrackingResponse,
  ServiceabilityParams,
  ServiceabilityResponse,
  NDRActionParams,
  NDRActionResponse,
} from './carrier-adapter';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function shiprocketFetch(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<any> {
  const url = `${SHIPROCKET_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('SHIPROCKET_API_ERROR:', { endpoint, status: res.status, data });
    throw new Error(data.message || `Shiprocket API error: ${res.status}`);
  }
  return data;
}

export class ShiprocketAdapter implements CarrierAdapter {
  name = 'Shiprocket';

  async authenticate(email: string, password: string) {
    const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(data.message || 'Shiprocket authentication failed');
    }

    return {
      token: data.token,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    };
  }

  async createOrder(params: CreateShipmentOrderParams, token: string): Promise<CarrierOrderResponse> {
    try {
      const body = {
        order_id: params.orderNumber,
        order_date: params.orderDate,
        pickup_location: params.pickupLocationId || 'Primary',
        billing_customer_name: params.billingName,
        billing_last_name: '',
        billing_address: params.billingAddress,
        billing_city: params.billingCity,
        billing_pincode: params.billingPincode,
        billing_state: params.billingState,
        billing_country: params.billingCountry || 'India',
        billing_email: params.billingEmail || '',
        billing_phone: params.billingPhone,
        shipping_is_billing: false,
        shipping_customer_name: params.shippingName,
        shipping_last_name: '',
        shipping_address: params.shippingAddress,
        shipping_city: params.shippingCity,
        shipping_pincode: params.shippingPincode,
        shipping_state: params.shippingState,
        shipping_country: params.shippingCountry || 'India',
        shipping_phone: params.shippingPhone,
        order_items: params.items.map((item) => ({
          name: item.name,
          sku: item.sku,
          units: item.units,
          selling_price: item.sellingPrice,
          hsn: item.hsnCode || '',
        })),
        payment_method: params.paymentMethod,
        sub_total: params.subTotal,
        weight: params.weightGrams / 1000, // Shiprocket uses kg
        length: params.lengthCm,
        breadth: params.breadthCm,
        height: params.heightCm,
      };

      const data = await shiprocketFetch('/orders/create/adhoc', token, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      return {
        success: true,
        carrierOrderId: String(data.order_id),
        shipmentId: String(data.shipment_id),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async assignAWB(shipmentId: string, courierCompanyId?: number, token?: string): Promise<AWBResponse> {
    try {
      const body: any = { shipment_id: shipmentId };
      if (courierCompanyId) body.courier_id = courierCompanyId;

      const data = await shiprocketFetch('/courier/assign/awb', token!, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const awbData = data.response?.data;
      return {
        success: true,
        awbNumber: awbData?.awb_code,
        courierCompanyId: awbData?.courier_company_id,
        courierName: awbData?.courier_name,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async generateLabel(shipmentId: string, token: string): Promise<LabelResponse> {
    try {
      const data = await shiprocketFetch('/courier/generate/label', token, {
        method: 'POST',
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      });

      return {
        success: true,
        labelUrl: data.label_url,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async schedulePickup(shipmentId: string, pickupDate: string, token: string): Promise<PickupResponse> {
    try {
      const data = await shiprocketFetch('/courier/generate/pickup', token, {
        method: 'POST',
        body: JSON.stringify({
          shipment_id: [shipmentId],
          pickup_date: [pickupDate],
        }),
      });

      return {
        success: true,
        pickupScheduledDate: pickupDate,
        pickupTokenNumber: data.pickup_token_number,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getTracking(awbNumber: string, token: string): Promise<TrackingResponse> {
    try {
      const data = await shiprocketFetch(`/courier/track/awb/${awbNumber}`, token);

      const trackingData = data.tracking_data;
      const activities = trackingData?.shipment_track_activities || [];

      return {
        success: true,
        currentStatus: trackingData?.shipment_status?.toString(),
        currentStatusCode: trackingData?.shipment_status?.toString(),
        events: activities.map((act: any) => ({
          status: act['sr-status'] || act.activity,
          statusCode: act['sr-status-label'],
          description: act.activity,
          location: act.location,
          city: act.location,
          timestamp: act.date,
          rawPayload: act,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message, events: [] };
    }
  }

  async checkServiceability(params: ServiceabilityParams, token: string): Promise<ServiceabilityResponse> {
    try {
      const qs = new URLSearchParams({
        pickup_postcode: params.pickupPincode,
        delivery_postcode: params.deliveryPincode,
        weight: String(params.weightGrams / 1000),
        cod: params.isCOD ? '1' : '0',
      });

      const data = await shiprocketFetch(
        `/courier/serviceability/?${qs.toString()}`,
        token,
      );

      const couriers = data.data?.available_courier_companies || [];
      return {
        success: true,
        serviceable: couriers.length > 0,
        availableCouriers: couriers.map((c: any) => ({
          courierId: c.courier_company_id,
          courierName: c.courier_name,
          estimatedDays: c.estimated_delivery_days,
          freightCharge: c.freight_charge,
          codCharges: c.cod_charges || 0,
          totalCharge: c.rate,
          isCODAvailable: c.cod === 1,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message, serviceable: false, availableCouriers: [] };
    }
  }

  async handleNDR(params: NDRActionParams, token: string): Promise<NDRActionResponse> {
    try {
      const endpoint = params.action === 'reattempt'
        ? '/ndr/reattempt'
        : '/ndr/rto';

      await shiprocketFetch(endpoint, token, {
        method: 'POST',
        body: JSON.stringify({
          awb: params.awbNumber,
          ...(params.action === 'reattempt' && {
            re_attempt_date: params.reattemptDate,
            re_attempt_address: params.reattemptAddress,
            comments: params.comments,
          }),
        }),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async cancelShipment(orderId: string, token: string) {
    try {
      await shiprocketFetch('/orders/cancel', token, {
        method: 'POST',
        body: JSON.stringify({ ids: [orderId] }),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
