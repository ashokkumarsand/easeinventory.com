import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'demo' },
      update: {},
      create: {
        name: 'Acme Pro Electronics',
        slug: 'demo',
        email: 'hello@acme.com',
        address: '123 Tech Park, MG Road',
        city: 'Bangalore',
        primaryColor: '#0070f3',
      },
    });

    return NextResponse.json({ message: 'Demo tenant ready', slug: tenant.slug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
