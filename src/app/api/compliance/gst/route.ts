import { authOptions } from '@/lib/auth';
import { gspClient } from '@/lib/compliance/gsp-client';
import { GSTEngine } from '@/lib/compliance/gst-engine';
import { generateGSTReportPDF } from '@/lib/pdf-generator';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET - Fetch GST reports and summaries
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'summary', 'gstr1', or 'pdf'
    const month = searchParams.get('month'); // e.g., '2024-01'
    const format = searchParams.get('format'); // 'json' or 'pdf'

    if (!month) {
      return NextResponse.json({ message: 'Month is required (YYYY-MM)' }, { status: 400 });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // Get tenant info for PDF
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, gstNumber: true }
    });

    if (type === 'gstr1') {
      const gstr1 = await GSTEngine.generateGSTR1(tenantId, startDate, endDate);
      return NextResponse.json({ gstr1 });
    }

    // PDF Export
    if (format === 'pdf' || type === 'pdf') {
      const summary = await GSTEngine.getSalesSummary(tenantId, startDate, endDate);
      const gstr1Data = await GSTEngine.generateGSTR1(tenantId, startDate, endDate);

      // Transform GSTR1 data for PDF - flatten B2B invoices
      const invoices: Array<{
        invoiceNumber: string;
        invoiceDate: string;
        customerName: string;
        customerGstin: string;
        placeOfSupply: string;
        totalValue: string;
        taxableValue: string;
        gstRate: string;
        cgst: string;
        sgst: string;
        igst: string;
      }> = [];

      // Process B2B invoices (grouped by GSTIN in GSTR1 format)
      for (const b2bEntry of gstr1Data.b2b || []) {
        for (const inv of b2bEntry.inv || []) {
          const totalTax = inv.itms?.reduce((sum: number, itm: any) => sum + (itm.itm_det?.iamt || 0), 0) || 0;
          const taxableValue = inv.itms?.reduce((sum: number, itm: any) => sum + (itm.itm_det?.txval || 0), 0) || 0;
          invoices.push({
            invoiceNumber: inv.inum || 'N/A',
            invoiceDate: inv.idt || 'N/A',
            customerName: `GSTIN: ${b2bEntry.ctin}`,
            customerGstin: b2bEntry.ctin || '',
            placeOfSupply: inv.pos || 'Unknown',
            totalValue: String(inv.val || 0),
            taxableValue: String(taxableValue),
            gstRate: String(inv.itms?.[0]?.itm_det?.rt || 18),
            cgst: String(totalTax / 2),
            sgst: String(totalTax / 2),
            igst: String(0),
          });
        }
      }

      const pdfBuffer = await generateGSTReportPDF({
        tenantName: tenant?.name || 'Business',
        gstin: tenant?.gstNumber || '',
        month: month,
        summary: {
          totalAmount: summary.totalAmount || 0,
          totalTax: summary.totalTax || 0,
          totalB2B: summary.totalB2B || 0,
          totalB2C: summary.totalB2C || 0,
          invoiceCount: summary.invoiceCount || 0,
        },
        invoices,
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="GSTR1_${month}.pdf"`,
        },
      });
    }

    const summary = await GSTEngine.getSalesSummary(tenantId, startDate, endDate);
    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error('GST_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST - Generate e-Invoice or e-Way Bill
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { action, targetId } = body; // action: 'E_INVOICE' | 'E_WAY_BILL'

    if (action === 'E_WAY_BILL') {
        const transfer = await prisma.stockTransfer.findUnique({
            where: { id: targetId, tenantId },
            include: { sourceLocation: true, destLocation: true }
        });

        if (!transfer) {
            return NextResponse.json({ message: 'Transfer not found' }, { status: 404 });
        }

        const result = await gspClient.generateEWayBill({
            invoiceNumber: transfer.transferNumber,
            fromPincode: transfer.sourceLocation.pincode || '000000',
            toPincode: transfer.destLocation.pincode || '000000',
            distance: transfer.distance || 10,
            vehicleNumber: transfer.vehicleNumber || 'UP00AA0000'
        });

        if (result.success && result.data) {
            await prisma.stockTransfer.update({
                where: { id: targetId },
                data: {
                    ewayBillNumber: result.data.ewayBillNumber,
                    ewayBillDate: new Date(result.data.ewayBillDate)
                }
            });
            return NextResponse.json({ 
                message: 'e-Way Bill generated', 
                ewayBillNumber: result.data.ewayBillNumber 
            });
        }
        
        return NextResponse.json({ message: result.error || 'Failed to generate e-Way Bill' }, { status: 400 });
    }

    if (action === 'E_INVOICE') {
        const invoice = await prisma.invoice.findUnique({
            where: { id: targetId, tenantId },
            include: { items: true, customer: true }
        });

        if (!invoice) {
            return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
        }

        const result = await gspClient.generateEInvoice({
            invoiceId: invoice.id,
            items: invoice.items,
            customerGst: invoice.customer?.gstNumber || undefined,
            totalAmount: Number(invoice.total)
        });

        if (result.success && result.data) {
            await prisma.invoice.update({
                where: { id: targetId },
                data: {
                    irn: result.data.irn,
                    signedQrCode: result.data.signedQrCode,
                    signedInvoice: result.data.signedInvoice,
                    gstStatus: 'GENERATED'
                }
            });
            return NextResponse.json({ 
                message: 'e-Invoice generated', 
                irn: result.data.irn 
            });
        }

        return NextResponse.json({ message: result.error || 'Failed to generate e-Invoice' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('GST_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
