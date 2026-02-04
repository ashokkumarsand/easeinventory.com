import { logSecurityAction, SecurityAction } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Middleware to check admin/HR permissions
async function checkPermission(session: any) {
  if (!session?.user) return { error: 'Unauthorized', status: 401 };
  
  const role = (session.user as any).role;
  if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }
  return null;
}

// GET - List all users for tenant
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

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate user IDs (USR-001 format)
    const usersWithIds = users.map((user: typeof users[number], index: number) => ({
      ...user,
      userId: `USR-${String(users.length - index).padStart(3, '0')}`,
    }));

    return NextResponse.json({ users: usersWithIds });

  } catch (error: any) {
    console.error('USERS_LIST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permError = await checkPermission(session);
    if (permError) {
      return NextResponse.json({ message: permError.error }, { status: permError.status });
    }

    const tenantId = (session!.user as any).tenantId;
    const body = await req.json();
    const { name, email, phone, password, role } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check phone uniqueness if provided
    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { message: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: role || 'STAFF',
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    // ISO 27001: Audit log user creation
    await logSecurityAction({
      tenantId,
      userId: (session!.user as any).id,
      action: SecurityAction.USER_CREATED,
      resource: `User:${user.id}`,
      details: {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

    return NextResponse.json({
      message: 'User created successfully',
      user
    }, { status: 201 });

  } catch (error: any) {
    console.error('USER_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
