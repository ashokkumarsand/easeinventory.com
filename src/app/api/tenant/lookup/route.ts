import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const host = searchParams.get('host');
    const slug = searchParams.get('slug');

    if (!host && !slug) {
      return NextResponse.json({ message: 'Missing host or slug' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: slug || undefined },
          { customDomain: host || undefined },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        primaryColor: true,
        customDomain: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('TENANT_LOOKUP_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
