import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all employees for tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const employees = await prisma.employee.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ employees });

  } catch (error: any) {
    console.error('HR_EMPLOYEES_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new employee
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { 
        employeeId, 
        name, 
        email, 
        phone, 
        designation, 
        department, 
        joinDate, 
        baseSalary,
        dateOfBirth,
        gender,
        address,
        panNumber,
        aadharNumber,
        bankAccount,
        ifscCode
    } = body;

    if (!employeeId || !name || !baseSalary) {
      return NextResponse.json(
        { message: 'Employee ID, Name, and Salary are required' },
        { status: 400 }
      );
    }

    // Check if employeeId is unique for this tenant
    const existing = await prisma.employee.findUnique({
        where: {
            employeeId_tenantId: {
                employeeId,
                tenantId
            }
        }
    });

    if (existing) {
        return NextResponse.json(
            { message: 'Employee ID already exists in this company' },
            { status: 400 }
        );
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name,
        email,
        phone,
        designation,
        department,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        baseSalary: Number(baseSalary),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        panNumber,
        aadharNumber,
        bankAccount,
        ifscCode,
        tenantId,
        isActive: true,
      }
    });

    return NextResponse.json({
      message: 'Employee record created successfully',
      employee
    }, { status: 201 });

  } catch (error: any) {
    console.error('HR_EMPLOYEES_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
