import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, isActive } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[STAFF_PATCH]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
