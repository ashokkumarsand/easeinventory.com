import { sendContactFormNotification } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Contact form submission endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, message, plan, source } = body;

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

    // Store submission in database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        message,
        plan: plan || null,
        source: source || null,
      },
    });

    // Send email notification (non-blocking)
    sendContactFormNotification({
      name,
      email,
      phone,
      company,
      message,
      plan,
    }).catch((err) => {
      console.error('Email notification failed:', err);
    });

    console.log('Contact form submission stored:', submission.id);

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

// GET - List contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // Note: In production, add proper authentication for admin access
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const submissions = await prisma.contactSubmission.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Contact list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  }
}
