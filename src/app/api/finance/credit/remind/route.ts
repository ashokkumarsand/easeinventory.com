import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppNotification, WA_TEMPLATES } from '@/lib/whatsapp-service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST - Trigger bulk WhatsApp reminders for all customers with outstanding balance
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    // Fetch customers with outstanding in a single query-like aggregation or fetch all and filter
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        invoices: {
          select: {
            total: true,
            paidAmount: true,
          }
        }
      }
    });

    const debtors = customers.filter(c => {
      const totalInvoiced = c.invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
      const totalPaid = c.invoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
      return totalInvoiced - totalPaid > 0;
    });

    let sentCount = 0;
    for (const debtor of debtors) {
      if (!debtor.phone) continue;

      const totalInvoiced = debtor.invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
      const totalPaid = debtor.invoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
      const outstanding = totalInvoiced - totalPaid;

      try {
        await sendWhatsAppNotification({
          to: debtor.phone,
          templateName: WA_TEMPLATES.PAYMENT_REMINDER || 'payment_reminder',
          variables: {
            customerName: debtor.name,
            amount: `₹${outstanding.toLocaleString()}`
          }
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder to ${debtor.phone}:`, err);
      }
    }

    return NextResponse.json({ 
        message: 'Bulk reminders processed', 
        sentCount, 
        totalDebtors: debtors.length 
    });

  } catch (error) {
    console.error('BULK_REMINDER_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
