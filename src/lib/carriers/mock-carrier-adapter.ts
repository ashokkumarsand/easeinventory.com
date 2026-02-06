/**
 * Mock Carrier Adapter for development and testing.
 * Simulates Shiprocket-like responses without making real API calls.
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

export class MockCarrierAdapter implements CarrierAdapter {
  name = 'MockCarrier';

  async authenticate(_apiKey: string, _apiSecret: string) {
    console.log('[MockCarrier] Authenticating...');
    return {
      token: `mock_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    };
  }

  async createOrder(params: CreateShipmentOrderParams, _token: string): Promise<CarrierOrderResponse> {
    console.log('[MockCarrier] Creating order:', params.orderNumber);
    return {
      success: true,
      carrierOrderId: `MOCK-${Date.now()}`,
      shipmentId: `MOCK-SHP-${Date.now()}`,
    };
  }

  async assignAWB(_carrierOrderId: string, _courierCompanyId?: number, _token?: string): Promise<AWBResponse> {
    const awb = `${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    console.log('[MockCarrier] Assigning AWB:', awb);
    return {
      success: true,
      awbNumber: awb,
      courierCompanyId: 1,
      courierName: 'MockExpress',
    };
  }

  async generateLabel(_carrierOrderId: string, _token: string): Promise<LabelResponse> {
    console.log('[MockCarrier] Generating label');
    return {
      success: true,
      labelUrl: 'https://example.com/mock-label.pdf',
    };
  }

  async schedulePickup(_carrierOrderId: string, pickupDate: string, _token: string): Promise<PickupResponse> {
    console.log('[MockCarrier] Scheduling pickup for:', pickupDate);
    return {
      success: true,
      pickupScheduledDate: pickupDate,
      pickupTokenNumber: `PK-${Date.now()}`,
    };
  }

  async getTracking(_awbNumber: string, _token: string): Promise<TrackingResponse> {
    console.log('[MockCarrier] Fetching tracking');
    const now = new Date().toISOString();
    return {
      success: true,
      currentStatus: 'IN_TRANSIT',
      currentStatusCode: '17',
      events: [
        {
          status: 'Shipment Created',
          statusCode: '1',
          description: 'Shipment has been created',
          location: 'Warehouse',
          city: 'Mumbai',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'Picked Up',
          statusCode: '6',
          description: 'Shipment picked up by courier',
          location: 'Hub',
          city: 'Mumbai',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'In Transit',
          statusCode: '17',
          description: 'Shipment in transit to destination',
          location: 'Transit Hub',
          city: 'Pune',
          timestamp: now,
        },
      ],
    };
  }

  async checkServiceability(params: ServiceabilityParams, _token: string): Promise<ServiceabilityResponse> {
    console.log('[MockCarrier] Checking serviceability:', params.pickupPincode, '->', params.deliveryPincode);
    return {
      success: true,
      serviceable: true,
      availableCouriers: [
        {
          courierId: 1,
          courierName: 'MockExpress',
          estimatedDays: 3,
          freightCharge: 65,
          codCharges: params.isCOD ? 30 : 0,
          totalCharge: params.isCOD ? 95 : 65,
          isCODAvailable: true,
        },
        {
          courierId: 2,
          courierName: 'MockPremium',
          estimatedDays: 1,
          freightCharge: 120,
          codCharges: params.isCOD ? 40 : 0,
          totalCharge: params.isCOD ? 160 : 120,
          isCODAvailable: true,
        },
      ],
    };
  }

  async handleNDR(_params: NDRActionParams, _token: string): Promise<NDRActionResponse> {
    console.log('[MockCarrier] Handling NDR');
    return { success: true };
  }

  async cancelShipment(_carrierOrderId: string, _token: string) {
    console.log('[MockCarrier] Cancelling shipment');
    return { success: true };
  }
}
