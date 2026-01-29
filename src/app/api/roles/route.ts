import { authOptions } from '@/lib/auth';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES } from '@/lib/permissions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all roles (predefined + custom)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    // Get all users grouped by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: { tenantId },
      _count: true
    });

    // Get all users to filter those with custom permissions on client side
    const allUsers = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        role: true,
        permissions: true
      }
    });
    
    // Filter users with custom permissions
    const customRoleUsers = allUsers.filter(u => u.permissions !== null);

    // Build role list
    const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS).map(role => ({
      key: role,
      label: role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' '),
      permissions: DEFAULT_ROLE_PERMISSIONS[role],
      userCount: usersByRole.find(u => u.role === role)?._count || 0,
      isDefault: true
    }));

    return NextResponse.json({
      roles,
      modules: PERMISSION_MODULES,
      customRoleUsers
    });

  } catch (error: any) {
    console.error('ROLES_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Assign custom permissions to a user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    // Only owners can modify roles
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can manage roles' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, permissions, role } = body;

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent self-demotion
    if (userId === (session.user as any).id && role && role !== 'OWNER') {
      return NextResponse.json(
        { message: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Update user permissions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(permissions && { permissions }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    return NextResponse.json({
      message: 'Permissions updated',
      user: updatedUser
    });

  } catch (error: any) {
    console.error('ROLES_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
