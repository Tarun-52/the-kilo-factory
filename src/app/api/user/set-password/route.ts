import { NextRequest, NextResponse } from "next/server";
import { decodeSessionToken } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/** Extract user ID from the JWT cookie via jose */
async function getUserId(request?: NextRequest): Promise<string | null> {
  const token = await decodeSessionToken(request);
  return (token?.sub as string) ?? null;
}

// POST /api/user/set-password
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Scramble the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save to database using the userId (matching your profile/route.ts logic)
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password set successfully!" });
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
  }
}