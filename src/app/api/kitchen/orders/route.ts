import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { itemVariant: { include: { item: true } } } },
      user: { select: { name: true, mobile: true } },
      address: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(orders);
}