import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Approve or Reject a leave request
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;
    const { id } = await params;

    // RBAC: Only OWNER, ADMIN, or MANAGER can approve/reject
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'MANAGER') {
      return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // 1. Verify the leave exists and belongs to the same tenant
    const leave = await prisma.leave.findUnique({
        where: { id },
        include: { employee: true }
    });

    if (!leave || leave.employee.tenantId !== tenantId) {
        return NextResponse.json({ message: 'Leave request not found' }, { status: 404 });
    }

    // 2. Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        approvedBy: (session.user as any).id,
        approvedAt: new Date()
      }
    });

    // 3. If approved, update attendance for those days as ON_LEAVE
    // This is a simplified version - in a real app, you'd iterate through the date range
    // For now, we'll just return the updated leave.

    return NextResponse.json({
      message: `Leave request ${status.toLowerCase()}`,
      leave: updatedLeave
    });

  } catch (error: any) {
    console.error('HR_LEAVES_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
