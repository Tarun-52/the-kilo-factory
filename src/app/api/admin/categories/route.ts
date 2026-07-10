import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ── GET: List all categories ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const categories = await db.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// ── POST: Create a new category ─────────────────────────────────────
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { name, icon, description, displayOrder } = body as {
      name: string;
      icon?: string;
      description?: string;
      displayOrder?: number;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // If displayOrder not provided, put it at the end
    let order = displayOrder ?? 0;
    if (!displayOrder && displayOrder !== 0) {
      const maxOrder = await db.category.findFirst({
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      order = (maxOrder?.displayOrder ?? -1) + 1;
    }

    // Handle icon upload (base64 data URL)
    let iconValue = icon ?? "🍽️";
    if (icon && icon.startsWith("data:image/")) {
      iconValue = await saveBase64Image(icon, "category-icons");
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        icon: iconValue,
        description: description?.trim() || null,
        displayOrder: order,
        isActive: true,
      },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// ── PUT: Update a category ──────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id, name, icon, description, displayOrder, isActive } = body as {
      id: string;
      name?: string;
      icon?: string;
      description?: string;
      displayOrder?: number;
      isActive?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Handle icon upload (base64 data URL)
    let iconValue = icon;
    if (icon && icon.startsWith("data:image/")) {
      iconValue = await saveBase64Image(icon, "category-icons");
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(iconValue !== undefined && { icon: iconValue }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// ── DELETE: Soft-delete a category ──────────────────────────────────
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Don't allow deleting categories with active items
    if (existing._count.items > 0) {
      return NextResponse.json(
        { error: `Cannot delete category "${existing.name}" — it has ${existing._count.items} item(s). Move or delete items first.` },
        { status: 400 },
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

// ── Helper: Save base64 image to disk ───────────────────────────────
async function saveBase64Image(dataUrl: string, subfolder: string): Promise<string> {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return dataUrl;

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subfolder}/${filename}`;
}