import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { refundId: string } }
) {
  try {
    const { status, message } = await req.json();
    const { refundId } = params;

    const refund = await prisma.refundRequest.update({
      where: { id: refundId },
      data: {
        status,
        messages: {
            push: {
                sender: 'ADMIN',
                message,
                sentAt: new Date().toISOString()
            }
        }
      },
    });

    // In a real app, you would send an email here
    console.log(`Email sent to client regarding refund ${refundId}: ${message}`);

    return NextResponse.json(refund);
  } catch (error) {
    return NextResponse.json({ message: "Error updating refund request" }, { status: 500 });
  }
}
