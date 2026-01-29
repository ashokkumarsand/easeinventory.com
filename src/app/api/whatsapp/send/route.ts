import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// WhatsApp Cloud API Configuration
const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., 919876543210)
  type: 'template' | 'text';
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
  text?: {
    body: string;
  };
}

// Message types and their costs (in paise for tracking)
const MESSAGE_COSTS = {
  marketing: 78, // ₹0.78
  utility: 16,   // ₹0.16
  authentication: 12, // ₹0.12
  service: 0,    // Free
};

// POST - Send WhatsApp Message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;

    const body = await req.json();
    const { 
      phone, 
      templateName, 
      templateParams,
      messageType = 'utility', // utility, marketing, authentication
      customMessage,
      referenceType, // invoice, order, notification
      referenceId 
    } = body;

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    // Format phone number (remove +, spaces, etc.)
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.length < 10) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }

    // Add India country code if not present
    const fullPhone = formattedPhone.startsWith('91') 
      ? formattedPhone 
      : `91${formattedPhone}`;

    // Check tenant's message quota
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true, settings: true }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    // Get message limits based on plan
    const messageLimits: Record<string, number> = {
      'FREE': 10,
      'STARTER': 100,
      'BUSINESS': 500,
      'ENTERPRISE': 2000,
    };

    const settings = (tenant.settings as any) || {};
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const messageUsage = settings.whatsappUsage?.[currentMonth] || 0;
    const limit = messageLimits[tenant.plan] || 10;

    if (messageUsage >= limit) {
      return NextResponse.json({ 
        message: 'WhatsApp message limit reached for this month',
        usage: messageUsage,
        limit,
        upgradeUrl: '/dashboard/settings/billing'
      }, { status: 429 });
    }

    // Get WhatsApp credentials from env
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ message: 'WhatsApp not configured' }, { status: 500 });
    }

    // Prepare message payload
    let messagePayload: any = {
      messaging_product: 'whatsapp',
      to: fullPhone,
      type: templateName ? 'template' : 'text',
    };

    if (templateName) {
      messagePayload.template = {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: templateParams || [],
          }
        ],
      };
    } else if (customMessage) {
      messagePayload.type = 'text';
      messagePayload.text = { body: customMessage };
    } else {
      return NextResponse.json({ message: 'Template name or custom message required' }, { status: 400 });
    }

    // Send message via WhatsApp Cloud API
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', result);
      return NextResponse.json({ 
        message: 'Failed to send WhatsApp message',
        error: result.error?.message || 'Unknown error'
      }, { status: 500 });
    }

    // Update message usage
    const newUsage = {
      ...settings.whatsappUsage,
      [currentMonth]: messageUsage + 1,
    };

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          whatsappUsage: newUsage,
        }
      }
    });

    // Log the message for analytics
    console.log(`WhatsApp sent: ${tenantId} → ${fullPhone.slice(-4)}, template: ${templateName || 'custom'}`);

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      usage: {
        sent: messageUsage + 1,
        limit,
        remaining: limit - messageUsage - 1,
      }
    });

  } catch (error: any) {
    console.error('WHATSAPP_SEND_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// GET - Get usage stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true, settings: true }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    const messageLimits: Record<string, number> = {
      'FREE': 10,
      'STARTER': 100,
      'BUSINESS': 500,
      'ENTERPRISE': 2000,
    };

    const settings = (tenant.settings as any) || {};
    const currentMonth = new Date().toISOString().slice(0, 7);
    const messageUsage = settings.whatsappUsage?.[currentMonth] || 0;
    const limit = messageLimits[tenant.plan] || 10;

    return NextResponse.json({
      plan: tenant.plan,
      currentMonth,
      usage: messageUsage,
      limit,
      remaining: Math.max(0, limit - messageUsage),
      usageHistory: settings.whatsappUsage || {},
    });

  } catch (error: any) {
    console.error('WHATSAPP_USAGE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
