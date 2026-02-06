import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "ei_preview_mode";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const isAdmin = user.role === "SUPER_ADMIN" || user.isInternalStaff;

    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const current = cookieStore.get(COOKIE_NAME)?.value === "true";
    const next = !current;

    if (next) {
      cookieStore.set(COOKIE_NAME, "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
      });
    } else {
      cookieStore.delete(COOKIE_NAME);
    }

    return NextResponse.json({ previewMode: next });
  } catch (error) {
    console.error("[PREVIEW_TOGGLE]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
