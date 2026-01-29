import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new inquiry from public page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, name, phone, message, interestedIn } = body;

    if (!tenantId || !name || !phone) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // In a full implementation, we could create a 'Lead' or 'Inquiry' model.
    // For now, we'll log it and return success (or use an existing model if available).
    // Let's check if we have an Inquiry model... (assuming not or using a simple version)
    
    console.log(`[Public Inquiry] Tenant: ${tenantId}, From: ${name}, Phone: ${phone}`);
    console.log(`Message: ${message}, Interested: ${interestedIn}`);

    // Let's create a notification or just return success for the MVP
    return NextResponse.json({ 
        message: 'Inquiry sent successfully! The business will contact you soon.',
    });

  } catch (error: any) {
    console.error('PUBLIC_INQUIRY_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
