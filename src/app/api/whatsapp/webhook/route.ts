import { NextRequest, NextResponse } from 'next/server';

// WhatsApp Webhook Handler
// Handles incoming messages and delivery status updates

export async function GET(req: NextRequest) {
  // Webhook verification for Meta
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log webhook payload for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ received: true });
    }

    // Handle incoming messages
    if (value.messages) {
      for (const message of value.messages) {
        await handleIncomingMessage(message, value.contacts?.[0], value.metadata);
      }
    }

    // Handle message status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await handleStatusUpdate(status);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('WHATSAPP_WEBHOOK_ERROR:', error);
    return NextResponse.json({ received: true }); // Always return 200 to avoid retries
  }
}

async function handleIncomingMessage(
  message: any, 
  contact: any, 
  metadata: any
) {
  const from = message.from; // Phone number
  const messageId = message.id;
  const timestamp = message.timestamp;
  const type = message.type;

  console.log(`Incoming WhatsApp from ${from}: ${type}`);

  // Handle different message types
  if (type === 'text') {
    const text = message.text?.body?.toLowerCase() || '';
    
    // Auto-respond to common queries (within 24h window = free)
    if (text.includes('status') || text.includes('order')) {
      // This would trigger order status lookup
      console.log('Order status inquiry from:', from);
    } else if (text.includes('help') || text.includes('support')) {
      console.log('Support request from:', from);
    }
  }

  if (type === 'button') {
    const buttonId = message.button?.payload;
    console.log(`Button click: ${buttonId} from ${from}`);
  }

  if (type === 'interactive') {
    const interactiveType = message.interactive?.type;
    if (interactiveType === 'button_reply') {
      const buttonId = message.interactive?.button_reply?.id;
      console.log(`Interactive button: ${buttonId} from ${from}`);
    } else if (interactiveType === 'list_reply') {
      const listId = message.interactive?.list_reply?.id;
      console.log(`List selection: ${listId} from ${from}`);
    }
  }

  // Store message for future processing if needed
  // await prisma.whatsappMessage.create({...})
}

async function handleStatusUpdate(status: any) {
  const messageId = status.id;
  const recipientId = status.recipient_id;
  const statusType = status.status; // sent, delivered, read, failed

  console.log(`Message ${messageId} to ${recipientId}: ${statusType}`);

  // Track delivery and read rates
  if (statusType === 'failed') {
    const errors = status.errors;
    console.error(`Message failed: ${messageId}`, errors);
  }

  // Update message status in database if tracking
  // await prisma.whatsappMessage.update({...})
}
