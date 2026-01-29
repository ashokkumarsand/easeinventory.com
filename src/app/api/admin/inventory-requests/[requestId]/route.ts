import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const { status, adminNote } = await req.json();
    const { requestId } = params;

    const request = await prisma.inventoryRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNote,
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ message: "Error updating inventory request" }, { status: 500 });
  }
}
