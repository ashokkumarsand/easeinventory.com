import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List carrier accounts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const carriers = await prisma.carrierAccount.findMany({
      where: { tenantId },
      select: {
        id: true,
        provider: true,
        name: true,
        pickupLocationName: true,
        isDefault: true,
        isActive: true,
        createdAt: true,
        // Exclude sensitive API keys
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ carriers });
  } catch (error: any) {
    console.error('CARRIERS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Add carrier account
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const body = await req.json();

    if (!body.provider || !body.name) {
      return NextResponse.json({ message: 'Provider and name are required' }, { status: 400 });
    }

    // If this is marked as default, unset other defaults
    if (body.isDefault) {
      await prisma.carrierAccount.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const carrier = await prisma.carrierAccount.create({
      data: {
        provider: body.provider,
        name: body.name,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        pickupLocationName: body.pickupLocationName,
        isDefault: body.isDefault || false,
        tenantId,
      },
    });

    return NextResponse.json(
      { message: 'Carrier account added', carrier: { id: carrier.id, provider: carrier.provider, name: carrier.name } },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('CARRIERS_POST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
