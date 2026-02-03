import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/hr/leave-balance - Get leave balances
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

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const where: any = {
      year,
      employee: {
        tenantId,
      },
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const balances = await prisma.leaveBalance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ balances });
  } catch (error) {
    console.error('Fetch leave balances error:', error);
    return NextResponse.json({ message: 'Failed to fetch leave balances' }, { status: 500 });
  }
}

// POST /api/hr/leave-balance - Create or update leave balance
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only OWNER, MANAGER can modify leave balances
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, year, casualTotal, sickTotal, earnedTotal } = body;

    if (!employeeId || !year) {
      return NextResponse.json({ message: 'Employee ID and year are required' }, { status: 400 });
    }

    // Verify employee belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId,
      },
    });

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    // Upsert the leave balance
    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_year: {
          employeeId,
          year,
        },
      },
      update: {
        ...(casualTotal !== undefined && { casualTotal }),
        ...(sickTotal !== undefined && { sickTotal }),
        ...(earnedTotal !== undefined && { earnedTotal }),
      },
      create: {
        employeeId,
        year,
        casualTotal: casualTotal ?? 12,
        sickTotal: sickTotal ?? 12,
        earnedTotal: earnedTotal ?? 15,
      },
    });

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Update leave balance error:', error);
    return NextResponse.json({ message: 'Failed to update leave balance' }, { status: 500 });
  }
}

// PATCH /api/hr/leave-balance - Initialize balances for all employees
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only OWNER can bulk initialize
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const year = body.year || new Date().getFullYear();
    const { casualTotal = 12, sickTotal = 12, earnedTotal = 15 } = body;

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: {
        tenantId,
        isActive: true,
      },
    });

    // Create balances for employees who don't have one for this year
    const results = await Promise.all(
      employees.map(async (emp) => {
        try {
          return await prisma.leaveBalance.upsert({
            where: {
              employeeId_year: {
                employeeId: emp.id,
                year,
              },
            },
            update: {}, // Don't update existing
            create: {
              employeeId: emp.id,
              year,
              casualTotal,
              sickTotal,
              earnedTotal,
            },
          });
        } catch {
          return null;
        }
      })
    );

    const created = results.filter(Boolean).length;

    return NextResponse.json({
      message: `Initialized leave balances for ${created} employees`,
      count: created,
    });
  } catch (error) {
    console.error('Initialize leave balances error:', error);
    return NextResponse.json({ message: 'Failed to initialize leave balances' }, { status: 500 });
  }
}
