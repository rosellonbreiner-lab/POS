import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "No tienes permisos de Administrador para eliminar repuestos del inventario." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID del producto requerido" }, { status: 400 });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        invoiceItems: true,
        orderItems: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "El repuesto no existe o ya fue eliminado." }, { status: 404 });
    }

    // 1. Si el producto NO tiene facturas ni órdenes de trabajo previas, se elimina físicamente de la base de datos
    if (existing.invoiceItems.length === 0 && existing.orderItems.length === 0) {
      await prisma.$transaction(async (tx) => {
        await tx.productLocation.deleteMany({ where: { productId: id } });
        await tx.stockMovement.deleteMany({ where: { productId: id } });
        await tx.quoteItem.deleteMany({ where: { productId: id } });
        await tx.product.delete({ where: { id } });
      });
      return NextResponse.json({
        success: true,
        message: `El repuesto "${existing.name}" ha sido eliminado definitivamente del inventario.`,
      });
    } else {
      // 2. Si el producto ya tiene historial fiscal/ventas, se descontinúa y retira del catálogo activo
      // sin romper la auditoría contable histórica
      await prisma.$transaction(async (tx) => {
        await tx.productLocation.deleteMany({ where: { productId: id } });
        await tx.product.update({
          where: { id },
          data: {
            currentStock: 0,
            description: `[DESCONTINUADO] ${existing.description || ""}`.trim(),
            motorcycleFit: `[DESCONTINUADO] ${existing.motorcycleFit || ""}`.trim(),
          },
        });
      });
      return NextResponse.json({
        success: true,
        message: `El repuesto "${existing.name}" ha sido retirado y descontinuado del catálogo.`,
      });
    }
  } catch (error: any) {
    console.error("Error al eliminar repuesto:", error);
    return NextResponse.json(
      { error: error?.message || "Error al procesar la eliminación del repuesto." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID del producto requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { addStock, currentStock, minStock, costPrice, sellingPrice } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "El producto no existe." }, { status: 404 });
    }

    let newStock = existing.currentStock;
    if (addStock !== undefined && typeof addStock === "number") {
      newStock = Math.max(0, existing.currentStock + addStock);
    } else if (currentStock !== undefined && typeof currentStock === "number") {
      newStock = Math.max(0, currentStock);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          currentStock: newStock,
          ...(minStock !== undefined ? { minStock } : {}),
          ...(costPrice !== undefined ? { costPrice } : {}),
          ...(sellingPrice !== undefined ? { sellingPrice } : {}),
        },
      });

      if (addStock && addStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            type: "ENTRADA_COMPRA",
            quantity: addStock,
            previousQty: existing.currentStock,
            newQty: newStock,
            reason: `Reposición de mercancía / Pedido a proveedor (+${addStock} uds)`,
          },
        });
      }

      return p;
    });

    return NextResponse.json({
      success: true,
      message: `Stock actualizado a ${updated.currentStock} unidades.`,
      product: updated,
    });
  } catch (error: any) {
    console.error("Error al actualizar stock de producto:", error);
    return NextResponse.json(
      { error: error?.message || "Error al actualizar stock de producto." },
      { status: 500 }
    );
  }
}

