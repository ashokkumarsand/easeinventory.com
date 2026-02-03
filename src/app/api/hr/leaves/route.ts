import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List leave requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;
    
    // Admins/Managers see all, others see own
    const where: any = {};
    const employee = await prisma.employee.findFirst({
        where: { email: session.user.email, tenantId }
    });

    if (role === 'OWNER' || role === 'ADMIN' || role === 'MANAGER') {
        where.employee = { tenantId };
    } else {
        if (!employee) return NextResponse.json({ leaves: [] });
        where.employeeId = employee.id;
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        employee: {
            select: { name: true, employeeId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ leaves });

  } catch (error: any) {
    console.error('HR_LEAVES_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// Helper to calculate number of days between two dates
function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// POST - Request a leave
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { leaveType, startDate, endDate, reason, employeeId: requestedEmployeeId } = body;

    // Find employee - either the requester or specified employee (for manager requests)
    let employee;
    if (requestedEmployeeId) {
      // Manager requesting on behalf of employee
      const role = (session.user as any).role;
      if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role)) {
        return NextResponse.json({ message: 'Cannot request leave for others' }, { status: 403 });
      }
      employee = await prisma.employee.findFirst({
        where: { id: requestedEmployeeId, tenantId }
      });
    } else {
      employee = await prisma.employee.findFirst({
        where: { email: session.user.email, tenantId }
      });
    }

    if (!employee) {
      return NextResponse.json({ message: 'Employee record not found.' }, { status: 404 });
    }

    // Calculate leave days
    const leaveDays = calculateLeaveDays(new Date(startDate), new Date(endDate));
    const year = new Date(startDate).getFullYear();

    // Check leave balance for non-UNPAID leaves
    if (leaveType !== 'UNPAID') {
      const balance = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_year: {
            employeeId: employee.id,
            year,
          },
        },
      });

      if (balance) {
        let available = 0;
        switch (leaveType) {
          case 'CASUAL':
            available = balance.casualTotal - balance.casualUsed;
            break;
          case 'SICK':
            available = balance.sickTotal - balance.sickUsed;
            break;
          case 'EARNED':
            available = balance.earnedTotal - balance.earnedUsed;
            break;
        }

        if (leaveDays > available) {
          return NextResponse.json({
            message: `Insufficient ${leaveType.toLowerCase()} leave balance. Available: ${available} days, Requested: ${leaveDays} days`,
          }, { status: 400 });
        }
      }
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: employee.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      message: 'Leave request submitted successfully',
      leave,
      leaveDays,
    }, { status: 201 });

  } catch (error: any) {
    console.error('HR_LEAVES_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
