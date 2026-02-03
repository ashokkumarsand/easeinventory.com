import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityAction, SecurityAction } from '@/lib/audit';

// GET /api/custom-roles/[id] - Get a specific custom role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const customRole = await prisma.customRole.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!customRole) {
      return NextResponse.json({ message: 'Custom role not found' }, { status: 404 });
    }

    return NextResponse.json({ customRole });
  } catch (error) {
    console.error('Fetch custom role error:', error);
    return NextResponse.json({ message: 'Failed to fetch custom role' }, { status: 500 });
  }
}

// PATCH /api/custom-roles/[id] - Update a custom role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only OWNER can update custom roles
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can update custom roles' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, color, permissions, isDefault } = body;

    // Verify role exists and belongs to tenant
    const existingRole = await prisma.customRole.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existingRole) {
      return NextResponse.json({ message: 'Custom role not found' }, { status: 404 });
    }

    // Check for name conflict if name is being changed
    if (name && name !== existingRole.name) {
      const nameConflict = await prisma.customRole.findFirst({
        where: {
          name: name.trim(),
          tenantId,
          id: { not: id },
        },
      });

      if (nameConflict) {
        return NextResponse.json({ message: 'A role with this name already exists' }, { status: 400 });
      }
    }

    // If setting as default, unset other defaults
    if (isDefault === true) {
      await prisma.customRole.updateMany({
        where: {
          tenantId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const updatedRole = await prisma.customRole.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(permissions && { permissions }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    // Log the action
    await logSecurityAction({
      tenantId,
      userId,
      action: SecurityAction.ROLE_UPDATED,
      resource: `CustomRole:${updatedRole.name}`,
      details: { roleId: updatedRole.id },
    });

    return NextResponse.json({ customRole: updatedRole });
  } catch (error) {
    console.error('Update custom role error:', error);
    return NextResponse.json({ message: 'Failed to update custom role' }, { status: 500 });
  }
}

// DELETE /api/custom-roles/[id] - Delete a custom role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only OWNER can delete custom roles
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can delete custom roles' }, { status: 403 });
    }

    const { id } = await params;

    // Verify role exists and belongs to tenant
    const existingRole = await prisma.customRole.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json({ message: 'Custom role not found' }, { status: 404 });
    }

    // Check if role has users assigned
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        { message: `Cannot delete role with ${existingRole._count.users} assigned user(s). Reassign users first.` },
        { status: 400 }
      );
    }

    await prisma.customRole.delete({ where: { id } });

    // Log the action
    await logSecurityAction({
      tenantId,
      userId,
      action: SecurityAction.ROLE_DELETED,
      resource: `CustomRole:${existingRole.name}`,
      details: { roleId: existingRole.id },
    });

    return NextResponse.json({ message: 'Custom role deleted' });
  } catch (error) {
    console.error('Delete custom role error:', error);
    return NextResponse.json({ message: 'Failed to delete custom role' }, { status: 500 });
  }
}
