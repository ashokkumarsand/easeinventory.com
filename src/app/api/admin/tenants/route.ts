import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TenantStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TenantStatus || TenantStatus.PENDING;

    const tenants = await prisma.tenant.findMany({
      where: {
        registrationStatus: status,
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("[TENANTS_GET]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, status } = await req.json();

    if (!tenantId || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Merge setupComplete into existing settings when approving
    const existing = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const currentSettings = (existing?.settings as any) || {};

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        registrationStatus: status,
        isActive: status === TenantStatus.APPROVED,
        ...(status === TenantStatus.APPROVED && {
          settings: { ...currentSettings, setupComplete: false },
        }),
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("[TENANT_PATCH]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
