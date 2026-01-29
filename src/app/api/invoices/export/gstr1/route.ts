import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Export GSTR-1 Data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'Date range is required' }, { status: 400 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: 'PAID', // Usually GSTR-1 is for filed/paid invoices
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Transform into GSTR-1 B2B/B2C format
    const gstr1Data = invoices.map((inv: any) => ({
      'Invoice Number': inv.invoiceNumber,
      'Invoice Date': inv.invoiceDate.toISOString().split('T')[0],
      'Customer Name': inv.customer?.name || 'Walk-in Customer',
      'Customer GSTIN': inv.customer?.gstNumber || 'URP', // Unregistered Person
      'Place of Supply': inv.customer?.state || 'Unknown',
      'Total Value': inv.total.toString(),
      'Taxable Value': inv.subtotal.toString(),
      'GST Rate': inv.items[0]?.product?.gstRate?.toString() || '18',
      'CGST': (Number(inv.taxAmount) / 2).toString(),
      'SGST': (Number(inv.taxAmount) / 2).toString(),
      'IGST': '0.00', // Logic based on state would go here
    }));

    return NextResponse.json({ 
        reportType: 'GSTR-1',
        count: invoices.length,
        data: gstr1Data 
    });

  } catch (error: any) {
    console.error('GSTR_EXPORT_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
