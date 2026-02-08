import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { invites } = body;

    if (!Array.isArray(invites) || invites.length === 0) {
      return NextResponse.json({ error: 'At least one invite is required' }, { status: 400 });
    }

    if (invites.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 invites at a time' }, { status: 400 });
    }

    const results: Array<{ email: string; tempPassword: string; role: string; error?: string }> = [];

    for (const invite of invites) {
      const { email, name, role } = invite;

      if (!email?.trim()) continue;

      // Check if email already exists
      const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (existing) {
        results.push({ email, tempPassword: '', role, error: 'Email already exists' });
        continue;
      }

      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      await prisma.user.create({
        data: {
          name: name?.trim() || email.split('@')[0],
          email: email.trim(),
          password: hashedPassword,
          role: role || 'STAFF',
          tenantId,
          isActive: true,
        },
      });

      results.push({ email, tempPassword, role: role || 'STAFF' });
    }

    // Update setup progress
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const currentSettings = (tenant?.settings as any) || {};

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...currentSettings,
          setupProgress: {
            ...currentSettings.setupProgress,
            team: true,
          },
        },
      },
    });

    const invited = results.filter((r) => !r.error);
    return NextResponse.json({
      message: `Invited ${invited.length} team member(s)`,
      results,
      invited: invited.length,
    });
  } catch (error) {
    console.error('[SETUP_INVITE]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
