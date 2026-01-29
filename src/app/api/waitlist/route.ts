import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name, businessName, interests } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const entry = await prisma.waitlist.upsert({
      where: { email },
      update: {
        name: name || undefined,
        businessName: businessName || undefined,
        interests: interests || undefined,
      },
      create: {
        email,
        name,
        businessName,
        interests: interests || [],
      },
    });

    return NextResponse.json({ message: 'Success', entry });
  } catch (error) {
    console.error('WAITLIST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // In a real app, this would be protected by admin auth
  try {
    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
