import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Calculate overtime pay based on hours worked
 * Formula: (baseSalary / workingDays / standardHours) * overtimeHours * overtimeRate
 */
function calculateOvertimePay(
  baseSalary: number,
  workingDays: number,
  standardWorkHours: number,
  totalOvertimeHours: number,
  overtimeRate: number
): number {
  if (totalOvertimeHours <= 0) return 0;
  const hourlyRate = baseSalary / workingDays / standardWorkHours;
  return hourlyRate * totalOvertimeHours * overtimeRate;
}

// POST - Calculate & Generate Payslips for a month
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { month, year, includeOvertime = true } = await req.json();

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
            const presentAttendances = emp.attendances.filter((a: any) =>
              a.status === 'PRESENT' || a.status === 'LATE'
            );
            const presentDays = presentAttendances.length;
            const leaveDays = emp.leaves.length; // Simplified: should check exact dates overlapping the month

            const baseSalary = Number(emp.baseSalary);
            const salaryPerDay = baseSalary / workingDays;

            // Deductions for absence (simplified)
            const absentDays = Math.max(0, workingDays - (presentDays + leaveDays));
            const deductions = salaryPerDay * absentDays;

            // Calculate overtime from attendance records
            let totalOvertimeHours = 0;
            if (includeOvertime) {
              totalOvertimeHours = presentAttendances.reduce((sum: number, a: any) => {
                return sum + (a.overtimeHours || 0);
              }, 0);
            }

            const standardWorkHours = emp.standardWorkHours || 8;
            const overtimeRate = emp.overtimeRate || 1.5;

            const overtimePay = calculateOvertimePay(
              baseSalary,
              workingDays,
              standardWorkHours,
              totalOvertimeHours,
              overtimeRate
            );

            const netSalary = baseSalary - deductions + overtimePay;

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
                    deductions,
                    overtimeHours: totalOvertimeHours,
                    overtimePay,
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
                    deductions,
                    overtimeHours: totalOvertimeHours,
                    overtimePay,
                    netSalary,
                    status: 'GENERATED'
                }
            });
            generatedPayslips.push({
              ...payslip,
              employeeName: emp.name,
              employeeId: emp.employeeId,
            });
        }
        return generatedPayslips;
    });

    return NextResponse.json({
        message: `${results.length} payslips generated successfully`,
        payslips: results,
        summary: {
          totalEmployees: results.length,
          totalNetSalary: results.reduce((sum, p) => sum + Number(p.netSalary), 0),
          totalOvertimePay: results.reduce((sum, p) => sum + Number(p.overtimePay || 0), 0),
          totalOvertimeHours: results.reduce((sum, p) => sum + Number(p.overtimeHours || 0), 0),
        }
    });

  } catch (error: any) {
    console.error('PAYROLL_CALC_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
