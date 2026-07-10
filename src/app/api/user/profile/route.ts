import { NextRequest, NextResponse } from "next/server";
import { decodeSessionToken } from "@/lib/admin-auth";
import { db } from "@/lib/db";

/** Extract user ID from the JWT cookie via jose */
async function getUserId(request?: NextRequest): Promise<string | null> {
  const token = await decodeSessionToken(request);
  return (token?.sub as string) ?? null;
}

// GET /api/user/profile — fetch user profile + addresses
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: { isDefault: "desc", createdAt: "desc" } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orderStats = await db.order.aggregate({
      where: { userId, status: { not: "cancelled" } },
      _count: true,
      _sum: { total: true },
    });

    const pendingOrders = await db.order.count({
      where: {
        userId,
        status: { in: ["placed", "confirmed", "preparing", "dispatched"] },
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        image: user.image,
        createdAt: user.createdAt,
      },
      addresses: user.addresses,
      stats: {
        totalOrders: orderStats._count,
        totalSpent: orderStats._sum.total ?? 0,
        activeOrders: pendingOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT /api/user/profile — update name and mobile
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, mobile } = body as { name?: string; mobile?: string };

    if (!name && !mobile) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updateData: Record<string, string | null> = {};
    if (name !== undefined) updateData.name = name.trim() || null;
    if (mobile !== undefined) updateData.mobile = mobile.trim() || null;

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        mobile: updated.mobile,
        image: updated.image,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}