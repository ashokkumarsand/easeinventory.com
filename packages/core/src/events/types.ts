// Domain event types for EventBridge
export const EVENT_SOURCE = {
  ORDER: "easeinventory.order",
  INVENTORY: "easeinventory.inventory",
  ANALYTICS: "easeinventory.analytics",
  FINANCE: "easeinventory.finance",
  SUPPLY_CHAIN: "easeinventory.supply-chain",
  PLATFORM: "easeinventory.platform",
} as const;

export const EVENT_TYPE = {
  // Order events
  ORDER_CREATED: "OrderCreated",
  ORDER_CONFIRMED: "OrderConfirmed",
  ORDER_SHIPPED: "OrderShipped",
  ORDER_DELIVERED: "OrderDelivered",
  ORDER_CANCELLED: "OrderCancelled",

  // Inventory events
  STOCK_ADJUSTED: "StockAdjusted",
  STOCK_DEPLETED: "StockDepleted",
  STOCK_RECEIVED: "StockReceived",
  TRANSFER_COMPLETED: "TransferCompleted",

  // Supply chain events
  GRN_COMPLETED: "GRNCompleted",
  RETURN_APPROVED: "ReturnApproved",
  RETURN_RESTOCKED: "ReturnRestocked",
  PO_SENT: "POSent",

  // Finance events
  INVOICE_GENERATED: "InvoiceGenerated",
  PAYMENT_RECEIVED: "PaymentReceived",

  // Platform events
  USER_CREATED: "UserCreated",
  TENANT_APPROVED: "TenantApproved",

  // Analytics events
  REORDER_SUGGESTION: "ReorderSuggestionGenerated",
  ALERT_TRIGGERED: "AlertTriggered",
} as const;

// Base event envelope
export interface DomainEvent<T = Record<string, unknown>> {
  source: string;
  detailType: string;
  detail: T & {
    tenantId: string;
    timestamp: string;
    correlationId?: string;
  };
}

// Specific event payloads
export interface OrderCreatedEvent {
  tenantId: string;
  orderId: string;
  orderNumber: string;
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    locationId?: string;
  }>;
  totalAmount: number;
  timestamp: string;
}

export interface StockAdjustedEvent {
  tenantId: string;
  productId: string;
  locationId: string;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  userId: string;
  timestamp: string;
}

export interface GRNCompletedEvent {
  tenantId: string;
  goodsReceiptId: string;
  purchaseOrderId: string;
  items: Array<{
    productId: string;
    quantity: number;
    lotNumber?: string;
  }>;
  timestamp: string;
}
