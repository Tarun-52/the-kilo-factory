import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { status, deliveryPartnerName, deliveryPartnerPhone } = body;

  const updatedOrder = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(deliveryPartnerName && { deliveryPartnerName }),
      ...(deliveryPartnerPhone && { deliveryPartnerPhone }),
    },
    include: { items: true }
  });

  return NextResponse.json(updatedOrder);
}