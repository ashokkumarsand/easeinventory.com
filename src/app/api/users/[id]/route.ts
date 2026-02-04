import { logSecurityAction, SecurityAction } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get single user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = (session.user as any).tenantId;

    const user = await prisma.user.findFirst({
      where: { id, tenantId },
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
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error: any) {
    console.error('USER_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// PATCH - Update user (self or by admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const currentUserId = (session.user as any).id;
    const currentRole = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    // Users can only edit themselves, unless admin/HR
    const isAdmin = ['OWNER', 'ADMIN', 'HR_MANAGER'].includes(currentRole);
    if (id !== currentUserId && !isAdmin) {
      return NextResponse.json({ message: 'Cannot edit other users' }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, image, role, isActive } = body;

    // Non-admins cannot change role or active status
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (image) updateData.image = image;
    
    if (isAdmin) {
      if (role) updateData.role = role;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
    }

    // Get existing user for comparison
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { name: true, role: true, isActive: true }
    });

    const user = await prisma.user.update({
      where: { id, tenantId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isActive: true,
      }
    });

    // ISO 27001: Audit log user update
    const changedFields = Object.keys(updateData);
    await logSecurityAction({
      tenantId,
      userId: currentUserId,
      action: existingUser?.role !== user.role
        ? SecurityAction.USER_ROLE_CHANGED
        : SecurityAction.USER_UPDATED,
      resource: `User:${user.id}`,
      details: {
        changedFields,
        ...(existingUser?.role !== user.role && {
          previousRole: existingUser?.role,
          newRole: user.role
        }),
        ...(existingUser?.isActive !== user.isActive && {
          previousStatus: existingUser?.isActive ? 'active' : 'inactive',
          newStatus: user.isActive ? 'active' : 'inactive'
        })
      }
    });

    return NextResponse.json({ message: 'User updated', user });

  } catch (error: any) {
    console.error('USER_UPDATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Disable user (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const currentRole = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    if (!['OWNER', 'ADMIN', 'HR_MANAGER'].includes(currentRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    // Get user info before disabling
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true }
    });

    // Soft delete - just disable
    await prisma.user.update({
      where: { id, tenantId },
      data: { isActive: false }
    });

    // ISO 27001: Audit log user deletion (soft delete)
    await logSecurityAction({
      tenantId,
      userId: (session.user as any).id,
      action: SecurityAction.USER_DELETED,
      resource: `User:${id}`,
      details: {
        deletedUserName: userToDelete?.name,
        deletedUserEmail: userToDelete?.email,
        deleteType: 'soft_delete'
      }
    });

    return NextResponse.json({ message: 'User disabled successfully' });

  } catch (error: any) {
    console.error('USER_DELETE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
