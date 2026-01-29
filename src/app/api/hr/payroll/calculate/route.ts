import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Calculate & Generate Payslips for a month
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { month, year } = await req.json();

    if (!month || !year) {
      return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
    }

    const employees = await prisma.employee.findMany({
      where: { tenantId, isActive: true },
      include: {
        attendances: {
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0),
            }
          }
        },
        leaves: {
          where: {
            status: 'APPROVED',
            startDate: {
              lte: new Date(year, month, 0),
            },
            endDate: {
              gte: new Date(year, month - 1, 1),
            }
          }
        }
      }
    });

    const workingDays = new Date(year, month, 0).getDate(); // Days in month

    const results = await prisma.$transaction(async (tx: any) => {
        const generatedPayslips = [];

        for (const emp of employees) {
            const presentDays = emp.attendances.filter((a: any) => a.status === 'PRESENT').length;
            const leaveDays = emp.leaves.length; // Simplified: should check exact dates overlapping the month
            
            const salaryPerDay = Number(emp.baseSalary) / workingDays;
            const attendancePay = salaryPerDay * (presentDays + leaveDays); // Paid leaves included
            
            // Deductions for absence (simplified)
            const absentDays = workingDays - (presentDays + leaveDays);
            const deductions = salaryPerDay * absentDays;

            const netSalary = Number(emp.baseSalary) - deductions;

            const payslip = await tx.payslip.upsert({
                where: {
                    employeeId_month_year: {
                        employeeId: emp.id,
                        month,
                        year
                    }
                },
                update: {
                    baseSalary: emp.baseSalary,
                    workingDays,
                    presentDays,
                    leaveDays,
                    netSalary,
                    status: 'GENERATED'
                },
                create: {
                    employeeId: emp.id,
                    tenantId,
                    month,
                    year,
                    baseSalary: emp.baseSalary,
                    workingDays,
                    presentDays,
                    leaveDays,
                    netSalary,
                    status: 'GENERATED'
                }
            });
            generatedPayslips.push(payslip);
        }
        return generatedPayslips;
    });

    return NextResponse.json({
        message: `${results.length} payslips generated successfully`,
        payslips: results
    });

  } catch (error: any) {
    console.error('PAYROLL_CALC_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
