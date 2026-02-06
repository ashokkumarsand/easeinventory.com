import { authOptions } from '@/lib/auth';
import { generatePurchaseOrderPDF, type POPDFData } from '@/lib/po-pdf-generator';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Generate PO PDF
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const po = await PurchaseOrderService.getById(id, tenantId);

    if (!po) {
      return NextResponse.json({ message: 'Purchase order not found' }, { status: 404 });
    }

    // Get tenant info for the PDF
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const pdfData: POPDFData = {
      poNumber: po.poNumber,
      createdAt: po.createdAt.toISOString(),
      dueDate: po.dueDate?.toISOString(),
      paymentTerms: po.paymentTerms || undefined,
      notes: po.notes || undefined,
      tenantName: tenant?.name || 'Company',
      tenantAddress: tenant?.address || undefined,
      tenantGstin: tenant?.gstNumber || undefined,
      tenantPhone: tenant?.phone || undefined,
      tenantEmail: tenant?.email || undefined,
      supplierName: po.supplier.name,
      supplierAddress: (po.supplier as any).address || undefined,
      supplierGstin: (po.supplier as any).gstNumber || undefined,
      supplierPhone: (po.supplier as any).phone || undefined,
      supplierEmail: (po.supplier as any).email || undefined,
      deliveryLocationName: po.deliveryLocation?.name || undefined,
      ewayBillNumber: po.ewayBillNumber || undefined,
      transporterName: po.transporterName || undefined,
      vehicleNumber: po.vehicleNumber || undefined,
      items: po.items.map((item) => ({
        productName: item.productName,
        sku: item.sku || undefined,
        hsnCode: item.hsnCode || undefined,
        orderedQty: item.orderedQty,
        unitCost: Number(item.unitCost),
        taxRate: Number(item.taxRate),
        total: Number(item.total),
      })),
      subtotal: Number(po.subtotal),
      taxAmount: Number(po.taxAmount),
      shipping: Number(po.shipping),
      total: Number(po.total),
      currency: po.currency,
    };

    const pdfBuffer = await generatePurchaseOrderPDF(pdfData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${po.poNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PO_PDF_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
