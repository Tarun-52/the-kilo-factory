import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { code, orderValue } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ valid: false, message: "Please enter a coupon code" }, { status: 400 });
    }

    if (typeof orderValue !== "number" || orderValue < 0) {
      return NextResponse.json({ valid: false, message: "A valid order value is required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, message: "This coupon is no longer active" });
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json({ valid: false, message: "This coupon is not yet active" });
    }

    if (coupon.validTo && now > coupon.validTo) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit" });
    }

    if (orderValue < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value is ₹${coupon.minOrderValue} for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.type === "flat") {
      discount = Math.min(coupon.value, orderValue);
    } else if (coupon.type === "percent") {
      discount = Math.round((orderValue * coupon.value) / 100);
    }

    return NextResponse.json({
      valid: true,
      coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value },
      discount,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ valid: false, message: "Could not validate coupon" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}