import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const veg = searchParams.get("veg");
    const search = searchParams.get("search");
    const bestseller = searchParams.get("bestseller");

    // Build where clause for items
    const itemWhere: Record<string, unknown> = { isActive: true };

    if (category && category !== "all") {
      itemWhere.category = { name: category, isActive: true };
    } else {
      itemWhere.category = { isActive: true };
    }

    if (veg === "true") {
      itemWhere.vegFlag = true;
    }

    if (search) {
      itemWhere.name = { contains: search, mode: "insensitive" };
    }

    if (bestseller === "true") {
      itemWhere.isBestseller = true;
    }

    // Fetch categories ordered by displayOrder
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    // Fetch items with variants and category, grouped by category
    const items = await db.item.findMany({
      where: itemWhere,
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
        category: true,
      },
      orderBy: [{ category: { displayOrder: "asc" } }, { isBestseller: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ categories, items });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}