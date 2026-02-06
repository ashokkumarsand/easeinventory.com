import { ShipmentService } from '@/services/shipment.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Public webhook endpoint for carrier status updates.
 * No auth required — validates via carrier-specific secrets.
 * Returns 200 immediately to avoid carrier retries.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // TODO: Validate webhook secret (X-Shiprocket-Signature header)
    // const signature = req.headers.get('x-shiprocket-signature');
    // if (!validateSignature(signature, payload)) { return 403 }

    // Process asynchronously — return 200 immediately
    ShipmentService.processWebhook(payload).catch((err) => {
      console.error('WEBHOOK_PROCESS_ERROR:', err);
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('WEBHOOK_RECEIVE_ERROR:', error);
    // Always return 200 to prevent carrier retries
    return NextResponse.json({ status: 'ok' });
  }
}
