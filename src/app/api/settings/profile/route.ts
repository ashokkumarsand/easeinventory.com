import { logSecurityAction, SecurityAction } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const tenantId = (session.user as any).tenantId;
    const body = await req.json();

    const { name, phone, currentPassword, newPassword } = body;

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json({ error: 'Cannot change password for OAuth accounts' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          password: hashedPassword,
        },
      });

      // Log password change
      await logSecurityAction({
        tenantId,
        userId,
        action: SecurityAction.SENSITIVE_DATA_UPDATE,
        resource: 'UserProfile',
        details: { fieldsUpdated: ['name', 'phone', 'password'] },
      });
    } else {
      // Update without password
      await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
        },
      });

      // Log profile update
      await logSecurityAction({
        tenantId,
        userId,
        action: SecurityAction.SENSITIVE_DATA_UPDATE,
        resource: 'UserProfile',
        details: { fieldsUpdated: ['name', 'phone'] },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}
