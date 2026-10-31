import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const orders = await prisma.workOrder.findMany({
    where: {
      status: {
        not: "ENTREGADA_Y_FACTURADA",
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      motorcycle: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();

    const order = await prisma.$transaction(async (tx) => {
      // 1. Crear o buscar cliente
      let customer = await tx.customer.findFirst({
        where: { name: body.customerName },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: body.customerName,
            phone: body.customerPhone || null,
          },
        });
      }

      // 2. Crear o buscar moto
      let moto = await tx.motorcycle.findUnique({
        where: { plate: body.plate },
      });

      if (!moto) {
        moto = await tx.motorcycle.create({
          data: {
            customerId: customer.id,
            plate: body.plate,
            brand: "Genérica",
            model: body.motoModel || "Motocicleta",
          },
        });
      }

      // 3. Descontar repuestos comprometidos y calcular costo
      let partsCost = 0;
      for (const part of body.parts) {
        const prod = await tx.product.findUnique({ where: { id: part.productId } });
        if (!prod || prod.currentStock < part.quantity) {
          throw new Error(`Stock insuficiente para "${prod?.name || part.productId}"`);
        }

        const newStock = prod.currentStock - part.quantity;
        await tx.product.update({
          where: { id: prod.id },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            type: "SALIDA_ORDEN_TRABAJO",
            quantity: -part.quantity,
            previousQty: prod.currentStock,
            newQty: newStock,
            reason: `Orden de Trabajo ${body.plate}`,
          },
        });

        partsCost += part.unitPrice * part.quantity;
      }

      const total = partsCost;

      // 4. Crear la orden con consecutivo automático
      const lastOrder = await tx.workOrder.findFirst({
        orderBy: { consecutive: "desc" },
      });
      const nextConsecutive = lastOrder ? lastOrder.consecutive + 1 : 1001;

      const createdOrder = await tx.workOrder.create({
        data: {
          consecutive: nextConsecutive,
          customerId: customer.id,
          motorcycleId: moto.id,
          userId: user.id,
          status: "RECIBIDA",
          mileage: Number(body.mileage) || null,
          diagnosis: body.diagnosis || "Despacho de repuestos para vehículo",
          laborCost: 0,
          partsCost,
          total,
          items: {
            create: body.parts.map((p: any) => ({
              productId: p.productId,
              quantity: p.quantity,
              unitPrice: p.unitPrice,
              totalPrice: p.unitPrice * p.quantity,
            })),
          },
        },
        include: {
          customer: true,
          motorcycle: true,
          items: { include: { product: true } },
        },
      });

      return createdOrder;
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error creating work order:", error);
    return NextResponse.json(
      { error: error?.message || "Error al crear la orden" },
      { status: 400 }
    );
  }
}

