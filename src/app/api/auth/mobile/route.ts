import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

// POST /api/auth/mobile - Mobile app authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, workspace } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // --- MASTER ADMIN CHECK ---
    const MASTER_ADMIN_USER = process.env.ADMIN_USERNAME || 'easeinventoryadmin';
    const MASTER_ADMIN_PASS = process.env.ADMIN_PASSWORD || '123456789';

    if (email === MASTER_ADMIN_USER && password === MASTER_ADMIN_PASS) {
      const token = jwt.sign(
        {
          id: 'master-admin',
          email: 'admin@easeinventory.com',
          role: 'SUPER_ADMIN',
          tenantId: 'system',
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        token,
        user: {
          id: 'master-admin',
          email: 'admin@easeinventory.com',
          name: 'Master Admin',
          role: 'SUPER_ADMIN',
          tenantId: 'system',
          tenantSlug: 'admin',
        },
      });
    }
    // --------------------------

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate workspace if provided
    if (workspace && user.tenant?.slug !== workspace) {
      return NextResponse.json(
        { message: 'Invalid workspace for this user' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Your account is deactivated' },
        { status: 403 }
      );
    }

    // Check tenant status
    if (user.tenant && user.tenant.registrationStatus !== 'APPROVED') {
      return NextResponse.json(
        { message: 'Your business account is pending approval' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log the login
    if (user.tenantId) {
      await prisma.securityLog.create({
        data: {
          action: 'LOGIN_MOBILE',
          details: {
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            platform: 'mobile',
          },
          userId: user.id,
          tenantId: user.tenantId,
        },
      });
    }

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: user.tenant?.slug || null,
      },
    });
  } catch (error: any) {
    console.error('Mobile auth error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET /api/auth/mobile - Verify token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
        tenantId: string;
      };

      // For master admin
      if (decoded.id === 'master-admin') {
        return NextResponse.json({
          valid: true,
          user: {
            id: 'master-admin',
            email: 'admin@easeinventory.com',
            name: 'Master Admin',
            role: 'SUPER_ADMIN',
            tenantId: 'system',
            tenantSlug: 'admin',
          },
        });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { tenant: true },
      });

      if (!user || !user.isActive) {
        return NextResponse.json(
          { message: 'User not found or inactive' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant?.slug || null,
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
}
