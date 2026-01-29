import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        planExpiresAt: true,
        registrationStatus: true,
      },
      orderBy: {
        planExpiresAt: 'asc',
      }
    });

    return NextResponse.json(tenants);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching licenses" }, { status: 500 });
  }
}
