import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decodeSessionToken } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const token = await decodeSessionToken(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Non-admin users only see their own orders
    const isAdmin = token?.isAdmin === true;
    const userId = token?.sub as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    // If user is logged in and NOT admin, filter to their orders only
    if (userId && !isAdmin) {
      where.userId = userId;
    }
    // If not logged in at all, require authentication
    if (!userId && !isAdmin) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            itemVariant: {
              include: {
                item: true,
              },
            },
          },
        },
        address: true,
        coupon: { select: { id: true, code: true, type: true, value: true } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await decodeSessionToken(request);
    const body = await request.json();
    const {
      items,
      address,
      userId: bodyUserId,
      couponCode,
      paymentMethod,
      specialInstructions,
      userName,
      userMobile,
    } = body as {
      items: { variantId: string; qty: number }[];
      address: {
        line1: string;
        line2?: string;
        city: string;
        pincode: string;
        label?: string;
      };
      userId?: string;
      couponCode?: string;
      paymentMethod?: string;
      specialInstructions?: string;
      userName?: string;
      userMobile?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!address?.line1 || !address?.city || !address?.pincode) {
      return NextResponse.json(
        { error: "Address line1, city, and pincode are required" },
        { status: 400 }
      );
    }

    // Only use the authenticated user's ID — never trust client-supplied userId
    const userId = (token?.sub as string) || null;

    // Update user's name/mobile if provided and user exists
    if (userId && (userName || userMobile)) {
      const updateData: Record<string, string> = {};
      if (userName) updateData.name = userName;
      if (userMobile) updateData.mobile = userMobile;
      if (Object.keys(updateData).length > 0) {
        await db.user.update({ where: { id: userId }, data: updateData });
      }
    }

    // Fetch all variants to calculate subtotal and validate
    const variantIds = items.map((i) => i.variantId);
    const variants = await db.itemVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: { item: true },
    });

    if (variants.length !== variantIds.length) {
      return NextResponse.json(
        { error: "One or more invalid variant IDs" },
        { status: 400 }
      );
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    let subtotal = 0;
    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} not found` },
          { status: 400 }
        );
      }
      subtotal += variant.price * item.qty;
    }

    // Fetch site settings
    const settings = await db.siteSettings.findMany();
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));
    const gstPercent = parseFloat(settingsMap.get("gst_percent") ?? "0");
    const packagingCharge = parseFloat(
      settingsMap.get("packaging_charge") ?? "0"
    );

    const gst = (subtotal * gstPercent) / 100;

    // Look up delivery fee from DeliveryZone by pincode
    const deliveryZone = await db.deliveryZone.findFirst({
      where: { pincode: address.pincode },
    });

    let deliveryFee = 0;
    if (deliveryZone) {
      if (!deliveryZone.isServiceable) {
        return NextResponse.json(
          { error: "Delivery is not available for this pincode" },
          { status: 400 }
        );
      }
      deliveryFee = deliveryZone.deliveryFee;
    }

    // Apply coupon discount if provided
    let discount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (
          (coupon.validTo === null || coupon.validTo >= now) &&
          coupon.validFrom <= now &&
          (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) &&
          subtotal >= coupon.minOrderValue
        ) {
          couponId = coupon.id;
          if (coupon.type === "flat") {
            discount = coupon.value;
          } else if (coupon.type === "percent") {
            discount = (subtotal * coupon.value) / 100;
          }
        }
      }
    }

    const total = subtotal + gst + packagingCharge + deliveryFee - discount;

    // Create or find address
    let addressId: string | undefined;
    if (userId) {
      const existingAddress = await db.address.findFirst({
        where: {
          userId,
          line1: address.line1,
          city: address.city,
          pincode: address.pincode,
        },
      });
      if (existingAddress) {
        addressId = existingAddress.id;
      } else {
        const newAddress = await db.address.create({
          data: {
            userId,
            label: address.label ?? "Home",
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            pincode: address.pincode,
          },
        });
        addressId = newAddress.id;
      }
    }

    // Create the order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: userId ?? null,
          addressId: addressId ?? null,
          status: "placed",
          subtotal,
          gst,
          packagingFee: packagingCharge,
          deliveryFee,
          discount,
          total,
          paymentMethod: paymentMethod ?? "cod",
          paymentStatus: "pending",
          specialInstructions: specialInstructions ?? null,
          couponId: couponId ?? null,
          items: {
            create: items.map((item) => ({
              itemVariantId: item.variantId,
              qty: item.qty,
              priceAtOrder: variantMap.get(item.variantId)!.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              itemVariant: {
                include: { item: true },
              },
            },
          },
          address: true,
          coupon: {
            select: { id: true, code: true, type: true, value: true },
          },
        },
      });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return createdOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}