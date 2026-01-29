import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendWhatsAppNotification, WA_TEMPLATES } from '@/lib/whatsapp-service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get single repair ticket details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { id } = await params;

    const ticket = await prisma.repairTicket.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, name: true, image: true, role: true }
        },
        product: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });

  } catch (error: any) {
    console.error('REPAIR_TICKET_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// PATCH - Update repair ticket (status, assignment, notes, costs)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { id } = await params;
    const body = await req.json();

    const {
      status,
      priority,
      assignedToId,
      diagnosis,
      repairNotes,
      partsUsed,
      laborCost,
      partsCost,
      totalCost,
    } = body;

    // Verify ownership
    const existingTicket = await prisma.repairTicket.findFirst({
       where: { id, tenantId }
    });

    if (!existingTicket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    const updatedTicket = await prisma.repairTicket.update({
      where: { id },
      data: {
        status: status || undefined,
        priority: priority || undefined,
        assignedToId: assignedToId || undefined,
        diagnosis: diagnosis || undefined,
        repairNotes: repairNotes || undefined,
        partsUsed: partsUsed || undefined,
        laborCost: laborCost !== undefined ? laborCost : undefined,
        partsCost: partsCost !== undefined ? partsCost : undefined,
        totalCost: totalCost !== undefined ? totalCost : undefined,
      },
      include: {
        customer: true,
        assignedTo: true
      }
    });

    // Handle WhatsApp Notifications on status change
    if (status && status !== existingTicket.status) {
      const customerPhone = updatedTicket.customer?.phone;
      if (customerPhone) {
        if (status === 'READY') {
          await sendWhatsAppNotification({
            to: customerPhone,
            templateName: WA_TEMPLATES.REPAIR_READY,
            variables: {
              ticket_id: updatedTicket.ticketNumber,
              total_amount: updatedTicket.totalCost.toString()
            }
          });
        } else {
          await sendWhatsAppNotification({
            to: customerPhone,
            templateName: WA_TEMPLATES.REPAIR_STATUS_UPDATE,
            variables: {
              ticket_id: updatedTicket.ticketNumber,
              new_status: status.replace(/_/g, ' ')
            }
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Repair ticket updated successfully',
      ticket: updatedTicket
    });

  } catch (error: any) {
    console.error('REPAIR_TICKET_UPDATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
