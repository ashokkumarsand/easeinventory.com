import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).tenantId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await req.json();
    const tenantId = (session.user as any).tenantId;

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    // Basic validation
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length < 3 || slug.length > 30) {
      return NextResponse.json({ message: "Invalid slug format" }, { status: 400 });
    }

    // Check if slug is taken
    const existing = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json({ message: "Subdomain already taken" }, { status: 400 });
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { slug }
    });

    return NextResponse.json({ 
      message: "Subdomain claimed successfully",
      tenant: updatedTenant 
    });
  } catch (error) {
    console.error("[CLAIM_SUBDOMAIN_POST]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
