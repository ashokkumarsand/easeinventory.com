import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const requests = await prisma.inventoryRequest.findMany({
      where: { tenantId: session.user.tenantId as string },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const request = await prisma.inventoryRequest.create({
      data: {
        tenantId: session.user.tenantId as string,
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
