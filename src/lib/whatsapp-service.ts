// WhatsApp Service - Helper functions for sending messages
import {
  deliveryUpdateTemplate,
  invoiceSentTemplate,
  orderConfirmationTemplate,
  paymentReceivedTemplate,
  paymentReminderTemplate
} from './whatsapp-templates';

export const WA_TEMPLATES = {
    INVOICE_SENT: 'invoice_sent',
    PAYMENT_RECEIVED: 'payment_received',
    ORDER_CONFIRMATION: 'order_confirmation',
    DELIVERY_UPDATE: 'delivery_update',
    PAYMENT_REMINDER: 'payment_reminder',
    STOCK_ALERT: 'stock_alert',
    OTP_VERIFICATION: 'otp_verification',
    REPAIR_RECEIVED: 'repair_received',
    REPAIR_READY: 'repair_ready',
    REPAIR_STATUS_UPDATE: 'repair_status_update',
};

const WHATSAPP_API_BASE = '/api/whatsapp/send';

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  usage?: {
    sent: number;
    limit: number;
    remaining: number;
  };
}

// Generic send function
async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  templateParams: any[],
  messageType: 'utility' | 'marketing' | 'authentication' = 'utility',
  referenceType?: string,
  referenceId?: string
): Promise<SendResult> {
  try {
    const response = await fetch(WHATSAPP_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        templateName,
        templateParams,
        messageType,
        referenceType,
        referenceId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message };
    }

    return {
      success: true,
      messageId: data.messageId,
      usage: data.usage,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Send invoice via WhatsApp
export async function sendInvoiceWhatsApp(
  phone: string,
  invoiceData: {
    customerName: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    invoiceLink?: string;
  }
): Promise<SendResult> {
  const template = invoiceSentTemplate({
    customerName: invoiceData.customerName,
    invoiceNumber: invoiceData.invoiceNumber,
    amount: `₹${invoiceData.amount.toLocaleString()}`,
    dueDate: invoiceData.dueDate.toLocaleDateString('en-IN'),
    invoiceLink: invoiceData.invoiceLink,
  });

  return sendWhatsAppMessage(
    phone,
    template.name,
    template.components,
    'utility',
    'invoice',
    invoiceData.invoiceNumber
  );
}

// Send payment confirmation
export async function sendPaymentConfirmation(
  phone: string,
  paymentData: {
    customerName: string;
    amount: number;
    invoiceNumber: string;
    paymentMethod: string;
  }
): Promise<SendResult> {
  const template = paymentReceivedTemplate({
    customerName: paymentData.customerName,
    amount: `₹${paymentData.amount.toLocaleString()}`,
    invoiceNumber: paymentData.invoiceNumber,
    paymentMethod: paymentData.paymentMethod,
  });

  return sendWhatsAppMessage(
    phone,
    template.name,
    template.components,
    'utility',
    'payment',
    paymentData.invoiceNumber
  );
}

// Send order confirmation
export async function sendOrderConfirmation(
  phone: string,
  orderData: {
    customerName: string;
    orderNumber: string;
    itemCount: number;
    totalAmount: number;
    estimatedDelivery?: Date;
  }
): Promise<SendResult> {
  const template = orderConfirmationTemplate({
    customerName: orderData.customerName,
    orderNumber: orderData.orderNumber,
    itemCount: orderData.itemCount.toString(),
    totalAmount: `₹${orderData.totalAmount.toLocaleString()}`,
    estimatedDelivery: orderData.estimatedDelivery?.toLocaleDateString('en-IN'),
  });

  return sendWhatsAppMessage(
    phone,
    template.name,
    template.components,
    'utility',
    'order',
    orderData.orderNumber
  );
}

// Send delivery status update
export async function sendDeliveryUpdate(
  phone: string,
  deliveryData: {
    customerName: string;
    orderNumber: string;
    status: 'shipped' | 'out_for_delivery' | 'delivered';
    trackingLink?: string;
  }
): Promise<SendResult> {
  const template = deliveryUpdateTemplate(deliveryData);

  return sendWhatsAppMessage(
    phone,
    template.name,
    template.components,
    'utility',
    'delivery',
    deliveryData.orderNumber
  );
}

// Send payment reminder (marketing - costs more)
export async function sendPaymentReminder(
  phone: string,
  reminderData: {
    customerName: string;
    invoiceNumber: string;
    amount: number;
    daysOverdue: number;
    paymentLink?: string;
  }
): Promise<SendResult> {
  const template = paymentReminderTemplate({
    customerName: reminderData.customerName,
    invoiceNumber: reminderData.invoiceNumber,
    amount: `₹${reminderData.amount.toLocaleString()}`,
    daysOverdue: reminderData.daysOverdue.toString(),
    paymentLink: reminderData.paymentLink,
  });

  return sendWhatsAppMessage(
    phone,
    template.name,
    template.components,
    'marketing', // Reminder is considered marketing
    'reminder',
    reminderData.invoiceNumber
  );
}

// Generic notification function (used by repair tickets and others)
export async function sendWhatsAppNotification(params: {
  to: string;
  templateName: string;
  variables: Record<string, string>;
}): Promise<SendResult> {
  const templateParams = Object.entries(params.variables).map(([key, value]) => ({
    type: 'text',
    text: value
  }));

  return sendWhatsAppMessage(
    params.to,
    params.templateName,
    templateParams,
    'utility'
  );
}

// Get WhatsApp usage stats
export async function getWhatsAppUsage(): Promise<{
  plan: string;
  usage: number;
  limit: number;
  remaining: number;
} | null> {
  try {
    const response = await fetch(WHATSAPP_API_BASE, { method: 'GET' });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
