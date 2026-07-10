import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's orders
    const todayOrders = await db.order.findMany({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      select: { total: true, status: true },
    });

    const todayOrderCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    // Total orders and revenue
    const totalOrdersAgg = await db.order.aggregate({
      _count: true,
      _sum: { total: true },
    });

    const totalOrderCount = totalOrdersAgg._count;
    const totalRevenue = totalOrdersAgg._sum.total ?? 0;

    // Top 10 items by quantity sold
    const topItems = await db.orderItem.groupBy({
      by: ["itemVariantId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 10,
    });

    // Enrich with variant and item info
    const enrichedTopItems = await Promise.all(
      topItems.map(async (entry) => {
        const variant = await db.itemVariant.findUnique({
          where: { id: entry.itemVariantId },
          include: { item: { select: { id: true, name: true, photoUrl: true } } },
        });
        return {
          itemVariantId: entry.itemVariantId,
          totalQty: entry._sum.qty ?? 0,
          variant: variant
            ? { id: variant.id, unit: variant.unit, price: variant.price }
            : null,
          item: variant?.item ?? null,
        };
      })
    );

    return NextResponse.json({
      todayOrderCount,
      todayRevenue,
      totalOrderCount,
      totalRevenue,
      topItems: enrichedTopItems,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}