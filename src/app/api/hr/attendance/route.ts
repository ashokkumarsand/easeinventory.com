import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get attendance for current user or tenant (filtered)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const employeeId = searchParams.get('employeeId');

    const where: any = { 
        tenantId,
        date: new Date(date)
    };
    
    // If not admin, only show self
    const role = (session.user as any).role;
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'MANAGER') {
        const employee = await prisma.employee.findFirst({
            where: { email: session.user.email, tenantId }
        });
        if (!employee) return NextResponse.json({ attendances: [] });
        where.employeeId = employee.id;
    } else if (employeeId) {
        where.employeeId = employeeId;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
            select: { name: true, employeeId: true, designation: true }
        }
      }
    });

    return NextResponse.json({ attendances });

  } catch (error: any) {
    console.error('HR_ATTENDANCE_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Punch In / Punch Out
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { lat, lng, type } = body; // type is 'IN' or 'OUT'

    // 1. Find the employee linked to this user
    const employee = await prisma.employee.findFirst({
        where: { email: session.user.email, tenantId }
    });

    if (!employee) {
        return NextResponse.json({ message: 'Employee record not found. Contact HR.' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Check if attendance record exists for today
    let attendance = await prisma.attendance.findUnique({
        where: {
            employeeId_date: {
                employeeId: employee.id,
                date: today
            }
        }
    });

    if (type === 'IN') {
        if (attendance?.checkIn) {
            return NextResponse.json({ message: 'Already punched in for today' }, { status: 400 });
        }

        if (attendance) {
            attendance = await prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    checkIn: new Date(),
                    checkInLat: lat,
                    checkInLng: lng,
                    status: 'PRESENT'
                }
            });
        } else {
            attendance = await prisma.attendance.create({
                data: {
                    employeeId: employee.id,
                    tenantId,
                    date: today,
                    checkIn: new Date(),
                    checkInLat: lat,
                    checkInLng: lng,
                    status: 'PRESENT'
                }
            });
        }
    } else {
        // Punch Out
        if (!attendance || !attendance.checkIn) {
            return NextResponse.json({ message: 'Must punch in before punching out' }, { status: 400 });
        }
        if (attendance.checkOut) {
            return NextResponse.json({ message: 'Already punched out for today' }, { status: 400 });
        }

        attendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: new Date(),
                checkOutLat: lat,
                checkOutLng: lng
            }
        });
    }

    return NextResponse.json({
      message: `Successfully punched ${type === 'IN' ? 'in' : 'out'}`,
      attendance
    });

  } catch (error: any) {
    console.error('HR_ATTENDANCE_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
