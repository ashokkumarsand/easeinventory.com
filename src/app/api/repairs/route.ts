import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendWhatsAppNotification, WA_TEMPLATES } from '@/lib/whatsapp-service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all repair tickets for tenant
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
    const priority = searchParams.get('priority');

    const where: any = { tenantId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tickets = await prisma.repairTicket.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true }
        },
        assignedTo: {
          select: { id: true, name: true }
        },
        product: {
          select: { id: true, name: true, modelNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tickets });

  } catch (error: any) {
    console.error('REPAIR_TICKETS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new repair ticket
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      productName,
      modelNumber,
      serialNumber,
      issueDescription,
      priority,
      status,
      images,
    } = body;

    if (!customerPhone || !productName || !issueDescription) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        phone: customerPhone,
        tenantId
      }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName || 'Walk-in Customer',
          phone: customerPhone,
          tenantId
        }
      });
    }

    // 2. Generate Ticket Number (TIC-XXXXX)
    const count = await prisma.repairTicket.count({ where: { tenantId } });
    const ticketNumber = `TIC-${(10000 + count + 1).toString()}`;

    // 3. Create Ticket
    const ticket = await prisma.repairTicket.create({
      data: {
        ticketNumber,
        productName,
        modelNumber,
        serialNumber,
        issueDescription,
        images: images || [],
        priority: priority || 'MEDIUM',
        status: status || 'RECEIVED',
        customerId: customer.id,
        tenantId
      },
      include: {
        customer: true
      }
    });

    // 4. Send WhatsApp Notification
    if (customer.phone) {
      await sendWhatsAppNotification({
        to: customer.phone,
        templateName: WA_TEMPLATES.REPAIR_RECEIVED,
        variables: {
          ticket_id: ticketNumber,
          product_name: productName
        }
      });
    }

    return NextResponse.json({
      message: 'Repair ticket created successfully',
      ticket
    }, { status: 201 });

  } catch (error: any) {
    console.error('REPAIR_TICKET_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
