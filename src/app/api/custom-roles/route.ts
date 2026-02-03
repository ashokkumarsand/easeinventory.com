import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityAction, SecurityAction } from '@/lib/audit';

// GET /api/custom-roles - List all custom roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const customRoles = await prisma.customRole.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const rolesWithCount = customRoles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: role.permissions,
      isDefault: role.isDefault,
      userCount: role._count.users,
      createdAt: role.createdAt,
    }));

    return NextResponse.json({ customRoles: rolesWithCount });
  } catch (error) {
    console.error('Fetch custom roles error:', error);
    return NextResponse.json({ message: 'Failed to fetch custom roles' }, { status: 500 });
  }
}

// POST /api/custom-roles - Create a new custom role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only OWNER can create custom roles
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can create custom roles' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, color, permissions } = body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ message: 'Name and permissions are required' }, { status: 400 });
    }

    // Check if role name already exists
    const existingRole = await prisma.customRole.findFirst({
      where: {
        name: name.trim(),
        tenantId,
      },
    });

    if (existingRole) {
      return NextResponse.json({ message: 'A role with this name already exists' }, { status: 400 });
    }

    const customRole = await prisma.customRole.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || '#6A3BF6',
        permissions,
        tenantId,
        createdById: userId,
      },
    });

    // Log the action
    await logSecurityAction({
      tenantId,
      userId,
      action: SecurityAction.ROLE_CREATED,
      resource: `CustomRole:${customRole.name}`,
      details: { roleId: customRole.id, permissions: permissions.length },
    });

    return NextResponse.json({ customRole }, { status: 201 });
  } catch (error) {
    console.error('Create custom role error:', error);
    return NextResponse.json({ message: 'Failed to create custom role' }, { status: 500 });
  }
}
