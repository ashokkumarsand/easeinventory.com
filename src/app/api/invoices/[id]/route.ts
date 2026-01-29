import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get single invoice details
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

    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: true,
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });

  } catch (error: any) {
    console.error('INVOICE_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// PATCH - Update invoice (status, payment details)
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
      paymentStatus,
      paidAmount,
      paymentMode,
      notes
    } = body;

    // Verify ownership
    const existingInvoice = await prisma.invoice.findFirst({
       where: { id, tenantId }
    });

    if (!existingInvoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        paidAmount: paidAmount !== undefined ? paidAmount : undefined,
        paymentMode: paymentMode || undefined,
        notes: notes || undefined
      }
    });

    return NextResponse.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });

  } catch (error: any) {
    console.error('INVOICE_UPDATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
