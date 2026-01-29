import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.toLowerCase().trim();

    if (!slug || slug.length < 3) {
      return NextResponse.json({ available: false, message: 'Invalid slug' }, { status: 400 });
    }

    // Reserved keywords
    const reserved = ['api', 'admin', 'login', 'register', 'dashboard', 'settings', 'auth', 'health'];
    if (reserved.includes(slug)) {
      return NextResponse.json({ available: false, message: 'Reserved keyword' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true }
    });

    return NextResponse.json({
      available: !tenant,
      message: tenant ? 'Slug already taken' : 'Slug available'
    });
  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json({ available: false, message: 'Internal server error' }, { status: 500 });
  }
}
