import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, decodeSessionToken } from "@/lib/admin-auth";

const VALID_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await decodeSessionToken(request);

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            itemVariant: {
              include: { item: true },
            },
          },
        },
        user: { select: { id: true, name: true, mobile: true, email: true } },
        address: true,
        coupon: { select: { id: true, code: true, type: true, value: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Auth check: admin can view any order, regular user can only view their own
    const isAdmin = token?.isAdmin === true;
    const isOwner = token?.sub && token.sub === order.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, porterRef, porterTrackingUrl } = body as {
      status?: string;
      porterRef?: string;
      porterTrackingUrl?: string;
    };

    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Verify order exists
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await db.order.update({
      where: { id },
      data: {
        status,
        ...(porterRef !== undefined && { porterRef }),
        ...(porterTrackingUrl !== undefined && { porterTrackingUrl }),
      },
      include: {
        items: {
          include: {
            itemVariant: {
              include: { item: true },
            },
          },
        },
        user: { select: { id: true, name: true, mobile: true, email: true } },
        address: true,
        coupon: { select: { id: true, code: true, type: true, value: true } },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}