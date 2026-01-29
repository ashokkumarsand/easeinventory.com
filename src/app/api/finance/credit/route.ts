import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET - List customers with their credit (Udhaar) summary
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    // Fetch customers and their invoices
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        invoices: {
          select: {
            total: true,
            paidAmount: true,
            status: true,
            invoiceDate: true,
          }
        }
      }
    });

    const creditSummary = customers.map(customer => {
      const invoices = customer.invoices || [];
      const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
      const totalPaid = invoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
      const outstanding = totalInvoiced - totalPaid;
      
      const lastTransaction = invoices.sort((a, b) => 
        new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      )[0]?.invoiceDate;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        totalInvoiced,
        totalPaid,
        outstanding,
        lastTransaction,
        invoiceCount: invoices.length
      };
    });

    // Filter to show only those with outstanding balance or sort by it
    const sortedSummary = creditSummary
      .filter(c => c.totalInvoiced > 0)
      .sort((a, b) => b.outstanding - a.outstanding);

    return NextResponse.json({ summary: sortedSummary });

  } catch (error) {
    console.error('CREDIT_LEDGER_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
