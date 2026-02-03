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

    // 2. Calculate leave days
    const calculateLeaveDays = (startDate: Date, endDate: Date): number => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const leaveDays = calculateLeaveDays(leave.startDate, leave.endDate);
    const year = new Date(leave.startDate).getFullYear();

    // 3. Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        approvedBy: (session.user as any).id,
        approvedAt: new Date()
      }
    });

    // 4. If approved, update leave balance
    if (status === 'APPROVED' && leave.leaveType !== 'UNPAID') {
      const balanceUpdate: any = {};
      switch (leave.leaveType) {
        case 'CASUAL':
          balanceUpdate.casualUsed = { increment: leaveDays };
          break;
        case 'SICK':
          balanceUpdate.sickUsed = { increment: leaveDays };
          break;
        case 'EARNED':
          balanceUpdate.earnedUsed = { increment: leaveDays };
          break;
      }

      // Update or create leave balance
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_year: {
            employeeId: leave.employeeId,
            year,
          },
        },
        update: balanceUpdate,
        create: {
          employeeId: leave.employeeId,
          year,
          casualUsed: leave.leaveType === 'CASUAL' ? leaveDays : 0,
          sickUsed: leave.leaveType === 'SICK' ? leaveDays : 0,
          earnedUsed: leave.leaveType === 'EARNED' ? leaveDays : 0,
        },
      });

      // 5. Create attendance records for leave days
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        try {
          await prisma.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: leave.employeeId,
                date: new Date(d),
              },
            },
            update: {
              status: 'ON_LEAVE',
              notes: `${leave.leaveType} leave`,
            },
            create: {
              employeeId: leave.employeeId,
              date: new Date(d),
              tenantId,
              status: 'ON_LEAVE',
              notes: `${leave.leaveType} leave`,
            },
          });
        } catch {
          // Ignore duplicate errors
        }
      }
    }

    return NextResponse.json({
      message: `Leave request ${status.toLowerCase()}`,
      leave: updatedLeave,
      leaveDays,
    });

  } catch (error: any) {
    console.error('HR_LEAVES_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
