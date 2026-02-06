// WhatsApp Message Templates for EaseInventory
// These template names must match templates created in Meta Business Manager

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document';
    text?: string;
    currency?: { fallback_value: string; code: string; amount_1000: number };
    date_time?: { fallback_value: string };
    image?: { link: string };
    document?: { link: string; filename: string };
  }>;
}

// Invoice sent notification
export function invoiceSentTemplate(params: {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  invoiceLink?: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'invoice_sent',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.invoiceNumber },
          { type: 'text', text: params.amount },
          { type: 'text', text: params.dueDate },
        ],
      },
      ...(params.invoiceLink ? [{
        type: 'button' as const,
        parameters: [{ type: 'text' as const, text: params.invoiceLink }],
      }] : []),
    ],
  };
}

// Payment received confirmation
export function paymentReceivedTemplate(params: {
  customerName: string;
  amount: string;
  invoiceNumber: string;
  paymentMethod: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'payment_received',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.amount },
          { type: 'text', text: params.invoiceNumber },
          { type: 'text', text: params.paymentMethod },
        ],
      },
    ],
  };
}

// Order confirmation
export function orderConfirmationTemplate(params: {
  customerName: string;
  orderNumber: string;
  itemCount: string;
  totalAmount: string;
  estimatedDelivery?: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'order_confirmation',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.orderNumber },
          { type: 'text', text: params.itemCount },
          { type: 'text', text: params.totalAmount },
          ...(params.estimatedDelivery ? [{ type: 'text' as const, text: params.estimatedDelivery }] : []),
        ],
      },
    ],
  };
}

// Delivery update
export function deliveryUpdateTemplate(params: {
  customerName: string;
  orderNumber: string;
  status: 'shipped' | 'out_for_delivery' | 'delivered';
  trackingLink?: string;
}): { name: string; components: TemplateComponent[] } {
  const statusMessages = {
    shipped: 'has been shipped',
    out_for_delivery: 'is out for delivery',
    delivered: 'has been delivered',
  };
  
  return {
    name: 'delivery_update',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.orderNumber },
          { type: 'text', text: statusMessages[params.status] },
        ],
      },
      ...(params.trackingLink ? [{
        type: 'button' as const,
        parameters: [{ type: 'text' as const, text: params.trackingLink }],
      }] : []),
    ],
  };
}

// Payment reminder
export function paymentReminderTemplate(params: {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  daysOverdue: string;
  paymentLink?: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'payment_reminder',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.invoiceNumber },
          { type: 'text', text: params.amount },
          { type: 'text', text: params.daysOverdue },
        ],
      },
      ...(params.paymentLink ? [{
        type: 'button' as const,
        parameters: [{ type: 'text' as const, text: params.paymentLink }],
      }] : []),
    ],
  };
}

// Stock alert for customers
export function stockAlertTemplate(params: {
  customerName: string;
  productName: string;
  message: string; // "back in stock" or "low stock"
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'stock_alert',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.productName },
          { type: 'text', text: params.message },
        ],
      },
    ],
  };
}

// OTP for authentication
export function otpTemplate(params: {
  otp: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'otp_verification',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.otp },
        ],
      },
    ],
  };
}

// Order confirmed notification
export function orderConfirmedTemplate(params: {
  customerName: string;
  orderNumber: string;
  total: string;
  itemCount: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'order_confirmed',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.orderNumber },
          { type: 'text', text: params.total },
          { type: 'text', text: params.itemCount },
        ],
      },
    ],
  };
}

// Order shipped with AWB tracking
export function orderShippedTemplate(params: {
  customerName: string;
  orderNumber: string;
  awbNumber: string;
  carrierName: string;
  trackingLink?: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'order_shipped',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.orderNumber },
          { type: 'text', text: params.awbNumber },
          { type: 'text', text: params.carrierName },
        ],
      },
      ...(params.trackingLink ? [{
        type: 'button' as const,
        parameters: [{ type: 'text' as const, text: params.trackingLink }],
      }] : []),
    ],
  };
}

// Order delivered confirmation
export function orderDeliveredTemplate(params: {
  customerName: string;
  orderNumber: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'order_delivered',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.orderNumber },
        ],
      },
    ],
  };
}

// Out for delivery notification
export function outForDeliveryTemplate(params: {
  customerName: string;
  orderNumber: string;
  estimatedTime?: string;
}): { name: string; components: TemplateComponent[] } {
  return {
    name: 'out_for_delivery',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.customerName },
          { type: 'text', text: params.orderNumber },
          ...(params.estimatedTime ? [{ type: 'text' as const, text: params.estimatedTime }] : []),
        ],
      },
    ],
  };
}
