import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/security';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { address, city, state, pincode, phone, email, bankName, accountNumber, ifscCode, upiId } = body;

    if (!address || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Address, city, state, and pincode are required' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const currentSettings = (tenant?.settings as any) || {};

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        address,
        city,
        state,
        pincode,
        phone: phone || undefined,
        email: email || undefined,
        bankName: bankName || undefined,
        accountNumber: accountNumber ? encrypt(accountNumber) : undefined,
        ifscCode: ifscCode || undefined,
        upiId: upiId || undefined,
        settings: {
          ...currentSettings,
          setupProgress: {
            ...currentSettings.setupProgress,
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('[SETUP_PROFILE]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
