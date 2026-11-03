import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { barcode: { contains: q } },
            { motorcycleFit: { contains: q } },
          ],
        }
      : {},
    include: {
      locations: {
        include: { location: true },
      },
      category: true,
      brand: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const settings = getSettings();
  const productCompanies = settings.productCompanies || {};

  // Filtrar descontinuados sin afectar campos nulos (mitigando lógica de 3 valores en SQLite)
  const activeProducts = products.filter((p) => {
    const isDiscDesc = p.description ? p.description.includes("[DESCONTINUADO]") : false;
    const isDiscFit = p.motorcycleFit ? p.motorcycleFit.includes("[DESCONTINUADO]") : false;
    return !isDiscDesc && !isDiscFit;
  });

  const productsWithCompany = activeProducts.map((p) => ({
    ...p,
    companyId: productCompanies[p.id] || "comp-mototaller",
  }));

  return NextResponse.json({ products: productsWithCompany });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
      return NextResponse.json({ error: "El nombre del repuesto es obligatorio (mínimo 2 letras)." }, { status: 400 });
    }

    if (!body.sku || typeof body.sku !== "string" || body.sku.trim().length === 0) {
      return NextResponse.json({ error: "El código SKU es obligatorio." }, { status: 400 });
    }

    const costPrice = Math.max(0, Number(body.costPrice) || 0);
    const salePrice = Math.max(0, Number(body.salePrice) || 0);
    const initialStock = Math.max(0, Number(body.initialStock) || 0);
    const minStock = Math.max(1, Number(body.minStock) || 3);

    const product = await prisma.$transaction(async (tx) => {
      // 1. Ubicación física
      let location = await tx.location.findFirst({
        where: {
          warehouse: "Principal",
          shelf: body.shelf || "E-01",
          level: Number(body.level) || 1,
          position: body.position || null,
        },
      });

      if (!location) {
        location = await tx.location.create({
          data: {
            warehouse: "Principal",
            shelf: body.shelf || "E-01",
            level: Number(body.level) || 1,
            position: body.position || null,
          },
        });
      }

      // 2. Crear producto
      const prod = await tx.product.create({
        data: {
          sku: body.sku.trim().toUpperCase(),
          barcode: body.barcode?.trim() || null,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          motorcycleFit: body.motorcycleFit?.trim() || null,
          costPrice,
          salePrice,
          currentStock: initialStock,
          minStock,
        },
      });

      // 3. Vincular ubicación
      await tx.productLocation.create({
        data: {
          productId: prod.id,
          locationId: location.id,
          quantity: initialStock,
        },
      });

      // 4. Kardex inicial
      if (initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            type: "AJUSTE_POSITIVO",
            quantity: initialStock,
            previousQty: 0,
            newQty: initialStock,
            reason: "Inventario Inicial",
          },
        });
      }

      // 5. Auditoría
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PRODUCT_CREATED",
          resource: "Product",
          resourceId: prod.id,
          details: {
            sku: prod.sku,
            name: prod.name,
            initialStock,
            salePrice,
          },
        },
      });

      return prod;
    });

    const settings = getSettings();
    const targetComp = body.companyId || (user.role !== "SUPERADMIN" ? settings.userCompanies?.[user.email.toLowerCase()] : "comp-mototaller") || "comp-mototaller";
    const productCompanies = {
      ...(settings.productCompanies || {}),
      [product.id]: targetComp,
    };
    saveSettings({ ...settings, productCompanies });

    return NextResponse.json({ success: true, product: { ...product, companyId: targetComp } });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error?.message || "Error al crear producto" },
      { status: 400 }
    );
  }
}

