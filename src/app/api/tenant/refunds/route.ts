import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.tenantId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const tenantId = (session!.user as any).tenantId;

  try {
    const requests = await prisma.refundRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.tenantId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const tenantId = (session!.user as any).tenantId;

  try {
    const { amount, reason, invoiceId } = await req.json();
    const request = await prisma.refundRequest.create({
      data: {
        tenantId,
        amount,
        reason,
        invoiceId,
        status: 'OPEN',
      }
    });
    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
