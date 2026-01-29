import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(promotions);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching promotions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const promotion = await prisma.promotion.create({
      data: {
        ...data,
        status: 'SENT', // Defaulting to SENT for now
        sentAt: new Date(),
      }
    });

    return NextResponse.json(promotion);
  } catch (error) {
    return NextResponse.json({ message: "Error creating promotion" }, { status: 500 });
  }
}
