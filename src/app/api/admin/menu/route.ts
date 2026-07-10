import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const categories = await db.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          include: {
            variants: {
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching admin menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const {
      name,
      categoryId,
      description,
      photoUrl,
      vegFlag,
      spiceLevel,
      isBestseller,
      isBulkOnly,
      leadTimeHours,
      variants,
    } = body as {
      name: string;
      categoryId: string;
      description?: string;
      photoUrl?: string;
      vegFlag?: boolean;
      spiceLevel?: number;
      isBestseller?: boolean;
      isBulkOnly?: boolean;
      leadTimeHours?: number;
      variants: { unit: string; price: number }[];
    };

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and categoryId are required" },
        { status: 400 }
      );
    }

    if (!variants || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      );
    }

    const item = await db.item.create({
      data: {
        name,
        categoryId,
        description: description ?? null,
        photoUrl: photoUrl ?? null,
        vegFlag: vegFlag ?? false,
        spiceLevel: spiceLevel ?? 0,
        isBestseller: isBestseller ?? false,
        isBulkOnly: isBulkOnly ?? false,
        leadTimeHours: leadTimeHours ?? 0,
        variants: {
          create: variants.map((v) => ({
            unit: v.unit,
            price: v.price,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      photoUrl,
      vegFlag,
      spiceLevel,
      isBestseller,
      isNew,
      isTodaysDeal,
      isBulkOnly,
      leadTimeHours,
      isActive,
      variants,
    } = body as {
      id: string;
      name?: string;
      description?: string;
      photoUrl?: string;
      vegFlag?: boolean;
      spiceLevel?: number;
      isBestseller?: boolean;
      isNew?: boolean;
      isTodaysDeal?: boolean;
      isBulkOnly?: boolean;
      leadTimeHours?: number;
      isActive?: boolean;
      variants?: { id?: string; unit: string; price: number; isActive?: boolean }[];
    };

    if (!id) {
      return NextResponse.json(
        { error: "Item id is required" },
        { status: 400 }
      );
    }

    const existing = await db.item.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = await db.$transaction(async (tx) => {
      // Update item fields
      const updatedItem = await tx.item.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(photoUrl !== undefined && { photoUrl }),
          ...(vegFlag !== undefined && { vegFlag }),
          ...(spiceLevel !== undefined && { spiceLevel }),
          ...(isBestseller !== undefined && { isBestseller }),
          ...(isNew !== undefined && { isNew }),
          ...(isTodaysDeal !== undefined && { isTodaysDeal }),
          ...(isBulkOnly !== undefined && { isBulkOnly }),
          ...(leadTimeHours !== undefined && { leadTimeHours }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          variants: true,
          category: true,
        },
      });

      // Update variants if provided
      if (variants && variants.length > 0) {
        // Process each variant
        for (const variant of variants) {
          if (variant.id) {
            // Update existing variant
            await tx.itemVariant.update({
              where: { id: variant.id },
              data: {
                unit: variant.unit,
                price: variant.price,
                ...(variant.isActive !== undefined && { isActive: variant.isActive }),
              },
            });
          } else {
            // Create new variant
            await tx.itemVariant.create({
              data: {
                itemId: id,
                unit: variant.unit,
                price: variant.price,
                isActive: variant.isActive ?? true,
              },
            });
          }
        }
      }

      // Return updated item with fresh variant data
      return tx.item.findUnique({
        where: { id },
        include: {
          variants: { orderBy: { createdAt: "asc" } },
          category: true,
        },
      });
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json(
        { error: "Item id is required" },
        { status: 400 }
      );
    }

    const existing = await db.item.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = await db.item.update({
      where: { id },
      data: { isActive: false },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error soft-deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}