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

// POST - Request a leave
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { leaveType, startDate, endDate, reason } = body;

    // Find employee
    const employee = await prisma.employee.findFirst({
        where: { email: session.user.email, tenantId }
    });

    if (!employee) {
        return NextResponse.json({ message: 'Employee record not found.' }, { status: 404 });
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
      leave
    }, { status: 201 });

  } catch (error: any) {
    console.error('HR_LEAVES_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
