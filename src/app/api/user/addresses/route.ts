import { NextRequest, NextResponse } from "next/server";
import { decodeSessionToken } from "@/lib/admin-auth";
import { db } from "@/lib/db";

/** Extract user ID from the JWT cookie via jose */
async function getUserId(request?: NextRequest): Promise<string | null> {
  const token = await decodeSessionToken(request);
  return (token?.sub as string) ?? null;
}

// GET /api/user/addresses — list user addresses
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc", createdAt: "desc" },
    });
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

// POST /api/user/addresses — add new address
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { label, line1, line2, city, pincode, isDefault } = body as {
      label?: string;
      line1: string;
      line2?: string;
      city: string;
      pincode: string;
      isDefault?: boolean;
    };

    if (!line1 || !city || !pincode) {
      return NextResponse.json({ error: "line1, city, and pincode are required" }, { status: 400 });
    }

    if (isDefault) {
      await db.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }

    const address = await db.address.create({
      data: { userId, label: label ?? "Home", line1, line2, city, pincode, isDefault: isDefault ?? false },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}

// PUT /api/user/addresses — update address or set default
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { id, label, line1, line2, city, pincode, isDefault, setDefault } = body as {
      id: string;
      label?: string;
      line1?: string;
      line2?: string;
      city?: string;
      pincode?: string;
      isDefault?: boolean;
      setDefault?: boolean;
    };

    if (!id) return NextResponse.json({ error: "Address id required" }, { status: 400 });

    const existing = await db.address.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    if (setDefault || isDefault) {
      await db.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }

    const updateData: Record<string, any> = {};
    if (label !== undefined) updateData.label = label;
    if (line1 !== undefined) updateData.line1 = line1;
    if (line2 !== undefined) updateData.line2 = line2 || null;
    if (city !== undefined) updateData.city = city;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (setDefault || isDefault) updateData.isDefault = true;

    const address = await db.address.update({ where: { id }, data: updateData });
    return NextResponse.json({ address });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

// DELETE /api/user/addresses — remove address
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await request.json() as { id: string };
    if (!id) return NextResponse.json({ error: "Address id required" }, { status: 400 });

    const existing = await db.address.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    await db.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}