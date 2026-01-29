import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all deliveries for tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Delivery agents only see their own deliveries
    const where: any = { 
      invoice: { tenantId } 
    };
    
    if (role === 'DELIVERY_AGENT') {
      where.deliveryAgentId = userId;
    }
    
    if (status) {
      where.status = status;
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            customer: {
              select: { id: true, name: true, phone: true, address: true }
            }
          }
        },
        deliveryAgent: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ deliveries });

  } catch (error: any) {
    console.error('DELIVERIES_LIST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new delivery
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!['OWNER', 'ADMIN', 'MANAGER'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const {
      invoiceId,
      deliveryAgentId,
      address,
      scheduledDate,
      notes,
    } = body;

    if (!invoiceId) {
      return NextResponse.json({ message: 'Invoice ID is required' }, { status: 400 });
    }

    const delivery = await prisma.delivery.create({
      data: {
        invoiceId,
        deliveryAgentId: deliveryAgentId || null,
        address: address || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        invoice: { select: { invoiceNumber: true } },
        deliveryAgent: { select: { name: true } }
      }
    });

    return NextResponse.json({
      message: 'Delivery created successfully',
      delivery
    }, { status: 201 });

  } catch (error: any) {
    console.error('DELIVERY_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
