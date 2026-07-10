import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

// GET — list all coupons (admin view)
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST — create a new coupon
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { code, type, value, minOrderValue, usageLimit, validTo } = body as {
      code: string;
      type: "flat" | "percent";
      value: number;
      minOrderValue?: number;
      usageLimit?: number;
      validTo?: string | null;
    };

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    if (!value || value <= 0) {
      return NextResponse.json({ error: "Discount value must be positive" }, { status: 400 });
    }

    if (type === "percent" && value > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100%" }, { status: 400 });
    }

    const existing = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type: type ?? "flat",
        value,
        minOrderValue: minOrderValue ?? 0,
        usageLimit: usageLimit ?? 0,
        validTo: validTo ? new Date(validTo) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

// PUT — toggle coupon active state
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id, isActive } = body as { id: string; isActive: boolean };

    if (!id) {
      return NextResponse.json({ error: "Coupon id is required" }, { status: 400 });
    }

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: { isActive: isActive !== undefined ? isActive : !existing.isActive },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}