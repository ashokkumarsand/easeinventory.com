import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/security';
import { sendWhatsAppNotification, WA_TEMPLATES } from '@/lib/whatsapp-service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all invoices for tenant
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

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: any = { tenantId };
    if (status) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, gstNumber: true }
        },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // ISO 27001: Decrypt sensitive customer data for the UI
    const decryptedInvoices = invoices.map(inv => {
      if (inv.customer?.gstNumber && inv.customer.gstNumber.includes(':')) {
        try {
          inv.customer.gstNumber = decrypt(inv.customer.gstNumber);
        } catch (e) {}
      }
      return inv;
    });

    return NextResponse.json({ invoices: decryptedInvoices });

  } catch (error: any) {
    console.error('INVOICES_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new invoice with items
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    // 0. Fetch Tenant and Customer for GST logic
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { gstNumber: true, state: true, currency: true }
    });

    const {
      customerName,
      customerPhone,
      items, // Array of { productId, description, quantity, unitPrice, taxRate }
      notes,
      termsAndConditions,
      invoiceDate,
      isTaxInclusive = false,
      currency = tenant?.currency || 'INR'
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Invoice must have at least one item' }, { status: 400 });
    }

    // 1. Find or create customer
    let customerId = null;
    let customerGst = null;
    let customerState = null;

    if (customerPhone) {
      let customer = await prisma.customer.findFirst({
        where: { phone: customerPhone, tenantId }
      });

      if (customer) {
        // ISO 27001: Decrypt for tax logic
        if (customer.gstNumber && customer.gstNumber.includes(':')) {
           try { customer.gstNumber = decrypt(customer.gstNumber); } catch (e) {}
        }
      } else {
        customer = await prisma.customer.create({
          data: {
            name: customerName || 'Walk-in Customer',
            phone: customerPhone,
            tenantId
          }
        });
      }
      customerId = customer.id;
      customerGst = customer.gstNumber;
      customerState = customer.state;
    }

    // 2. State-based Tax Detection (Intra-state vs Inter-state)
    let isInterState = false;
    if (tenant?.gstNumber && customerGst) {
      // Compare first 2 digits (State Code)
      if (tenant.gstNumber.substring(0, 2) !== customerGst.substring(0, 2)) {
        isInterState = true;
      }
    } else if (tenant?.state && customerState) {
      // Fallback to state name comparison
      if (tenant.state.toLowerCase() !== customerState.toLowerCase()) {
        isInterState = true;
      }
    }

    // 2. Generate Invoice Number (INV-YYYY-XXXXX)
    const currentYear = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      }
    });
    const invoiceNumber = `INV-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    // 3. Calculate Totals
    let subtotal = 0;
    let taxAmount = 0;
    
    const invoiceItemsData = items.map((item: any) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const taxRate = Number(item.taxRate || 18);
      
      let lineSubtotal, lineTax, lineTotal;

      if (isTaxInclusive) {
        lineTotal = quantity * unitPrice;
        lineSubtotal = lineTotal / (1 + (taxRate / 100));
        lineTax = lineTotal - lineSubtotal;
      } else {
        lineSubtotal = quantity * unitPrice;
        lineTax = lineSubtotal * (taxRate / 100);
        lineTotal = lineSubtotal + lineTax;
      }
      
      subtotal += lineSubtotal;
      taxAmount += lineTax;
      
      return {
        productId: item.productId || null,
        description: item.description,
        hsnCode: item.hsnCode || null,
        quantity,
        unitPrice,
        taxRate,
        taxAmount: lineTax,
        total: lineTotal
      };
    });

    const total = subtotal + taxAmount;

    // 4. Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        subtotal,
        taxAmount,
        total,
        notes,
        currency,
        isTaxInclusive,
        termsAndConditions,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        createdById: (session.user as any).id,
        tenantId,
        status: 'SENT',
        items: {
          create: invoiceItemsData
        }
      },
      include: {
        items: true,
        customer: true
      }
    });

    // 4.5 Handle Consignment Settlements
    for (const item of items) {
        if (item.productId) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                include: { supplier: true }
            });

            if (product?.isConsignment && product.supplierId) {
                const commission = product.consignmentCommission ? Number(product.consignmentCommission) : 10;
                const salePrice = item.unitPrice * item.quantity;
                const payoutAmount = salePrice * (1 - (commission / 100));

                await prisma.consignmentSettlement.create({
                    data: {
                        productId: product.id,
                        supplierId: product.supplierId,
                        invoiceId: invoice.id,
                        salePrice,
                        payoutAmount,
                        tenantId,
                        status: 'UNSETTLED'
                    }
                });
            }
        }
    }

    // 5. Send WhatsApp Notification
    if (customerPhone) {
      await sendWhatsAppNotification({
        to: customerPhone,
        templateName: WA_TEMPLATES.INVOICE_SENT,
        variables: {
          invoice_number: invoiceNumber,
          amount: total.toString()
        }
      });
    }

    return NextResponse.json({
      message: 'Invoice generated successfully',
      invoice
    }, { status: 201 });

  } catch (error: any) {
    console.error('INVOICE_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
