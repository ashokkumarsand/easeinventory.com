/**
 * Carrier Adapter Interface
 * Pluggable architecture for shipping carrier integrations (Shiprocket, Delhivery, etc.)
 * Follows the same adapter pattern as src/lib/compliance/gsp-client.ts
 */

export interface CreateShipmentOrderParams {
  orderNumber: string;
  orderDate: string; // ISO date string

  // Billing
  billingName: string;
  billingPhone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingCountry?: string;
  billingEmail?: string;

  // Shipping
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry?: string;

  // Payment
  paymentMethod: 'COD' | 'Prepaid';
  subTotal: number;
  codAmount?: number;

  // Package
  weightGrams: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;

  // Items
  items: ShipmentItem[];

  // Pickup location (carrier-side ID)
  pickupLocationId?: string;
}

export interface ShipmentItem {
  name: string;
  sku: string;
  units: number;
  sellingPrice: number;
  hsnCode?: string;
}

export interface CarrierOrderResponse {
  success: boolean;
  error?: string;
  carrierOrderId?: string;
  shipmentId?: string;
}

export interface AWBResponse {
  success: boolean;
  error?: string;
  awbNumber?: string;
  courierCompanyId?: number;
  courierName?: string;
}

export interface LabelResponse {
  success: boolean;
  error?: string;
  labelUrl?: string;
  labelBase64?: string;
}

export interface PickupResponse {
  success: boolean;
  error?: string;
  pickupScheduledDate?: string;
  pickupTokenNumber?: string;
}

export interface TrackingResponse {
  success: boolean;
  error?: string;
  currentStatus?: string;
  currentStatusCode?: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  status: string;
  statusCode?: string;
  description: string;
  location?: string;
  city?: string;
  timestamp: string; // ISO date string
  rawPayload?: Record<string, unknown>;
}

export interface ServiceabilityParams {
  pickupPincode: string;
  deliveryPincode: string;
  weightGrams: number;
  isCOD: boolean;
}

export interface ServiceabilityResponse {
  success: boolean;
  error?: string;
  serviceable: boolean;
  availableCouriers: CourierOption[];
}

export interface CourierOption {
  courierId: number;
  courierName: string;
  estimatedDays: number;
  freightCharge: number;
  codCharges: number;
  totalCharge: number;
  isCODAvailable: boolean;
}

export interface NDRActionParams {
  awbNumber: string;
  action: 'reattempt' | 'rto';
  reattemptDate?: string;
  reattemptAddress?: string;
  comments?: string;
}

export interface NDRActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Interface that all Carrier Adapters must implement
 */
export interface CarrierAdapter {
  name: string;

  /** Authenticate / refresh token */
  authenticate(apiKey: string, apiSecret: string): Promise<{ token: string; expiresAt: Date }>;

  /** Create a shipment order on the carrier side */
  createOrder(params: CreateShipmentOrderParams, token: string): Promise<CarrierOrderResponse>;

  /** Assign AWB (tracking number) to a shipment */
  assignAWB(carrierOrderId: string, courierCompanyId?: number, token?: string): Promise<AWBResponse>;

  /** Generate shipping label */
  generateLabel(carrierOrderId: string, token: string): Promise<LabelResponse>;

  /** Schedule carrier pickup */
  schedulePickup(carrierOrderId: string, pickupDate: string, token: string): Promise<PickupResponse>;

  /** Fetch tracking information */
  getTracking(awbNumber: string, token: string): Promise<TrackingResponse>;

  /** Check pincode serviceability */
  checkServiceability(params: ServiceabilityParams, token: string): Promise<ServiceabilityResponse>;

  /** Take action on NDR (reattempt or RTO) */
  handleNDR(params: NDRActionParams, token: string): Promise<NDRActionResponse>;

  /** Cancel a shipment */
  cancelShipment(carrierOrderId: string, token: string): Promise<{ success: boolean; error?: string }>;
}
