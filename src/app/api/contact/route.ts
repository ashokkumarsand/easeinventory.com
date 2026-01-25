import { NextRequest, NextResponse } from 'next/server';

// Contact form submission endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, message, plan } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Store in database or send to email service
    // For now, just log and return success
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      company,
      message,
      plan,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send notification email
    // TODO: Store lead in database

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
