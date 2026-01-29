import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const refunds = await prisma.refundRequest.findMany({
      include: {
        tenant: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(refunds);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching refund requests" }, { status: 500 });
  }
}
