import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const requests = await prisma.inventoryRequest.findMany({
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching inventory requests" }, { status: 500 });
  }
}
