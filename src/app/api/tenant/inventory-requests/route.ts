import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.tenantId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const tenantId = (session!.user as any).tenantId;

  try {
    const requests = await prisma.inventoryRequest.findMany({
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
    const data = await req.json();
    const request = await prisma.inventoryRequest.create({
      data: {
        tenantId,
        type: data.type,
        details: data,
        status: 'PENDING',
      }
    });
    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
