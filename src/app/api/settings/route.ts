import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const settings = await db.siteSettings.findMany();
    const kv: Record<string, string> = {};
    for (const s of settings) {
      kv[s.key] = s.value;
    }
    return NextResponse.json({ settings: kv });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const entries: { key: string; value: string }[] = body.settings;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Provide settings array" }, { status: 400 });
    }

    for (const entry of entries) {
      await db.siteSettings.upsert({
        where: { key: entry.key },
        update: { value: String(entry.value) },
        create: { key: entry.key, value: String(entry.value) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}