import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const quotes = await prisma.quote.findMany({
    where: {
      status: {
        not: "CONVERTIDA",
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      motorcycle: true,
      items: { include: { product: true } },
    },
  });

  const settings = getSettings();
  const quoteCompanies = settings.quoteCompanies || {};

  const quotesWithCompany = quotes.map((q) => ({
    ...q,
    companyId: quoteCompanies[q.id] || "comp-mototaller",
  }));

  return NextResponse.json({ quotes: quotesWithCompany });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();

    // 1. Cliente
    let customer = await prisma.customer.findFirst({
      where: { name: body.customerName },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: body.customerName, phone: body.customerPhone || null },
      });
    }

    // 2. Moto
    let moto = null;
    if (body.plate) {
      moto = await prisma.motorcycle.findUnique({
        where: { plate: body.plate },
      });
      if (!moto) {
        moto = await prisma.motorcycle.create({
          data: {
            customerId: customer.id,
            plate: body.plate,
            brand: "Genérica",
            model: body.motoModel || "Motocicleta",
          },
        });
      }
    }

    // 3. Consecutivo
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { consecutive: "desc" },
    });
    const nextConsecutive = lastQuote ? lastQuote.consecutive + 1 : 1001;

    let subtotal = 0;
    const itemsData = body.items.map((i: any) => {
      const lineTotal = i.unitPrice * i.quantity;
      subtotal += lineTotal;
      return {
        productId: i.productId || null,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: lineTotal,
      };
    });

    const total = subtotal;

    const quote = await prisma.quote.create({
      data: {
        consecutive: nextConsecutive,
        customerId: customer.id,
        motorcycleId: moto ? moto.id : null,
        userId: user.id,
        status: "BORRADOR",
        subtotal,
        taxAmount: Math.round(subtotal * 0.19),
        total,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        motorcycle: true,
        items: true,
      },
    });

    const settings = getSettings();
    const targetComp = body.companyId || (user.role !== "SUPERADMIN" ? settings.userCompanies?.[user.email.toLowerCase()] : "comp-mototaller") || "comp-mototaller";
    const quoteCompanies = {
      ...(settings.quoteCompanies || {}),
      [quote.id]: targetComp,
    };
    saveSettings({ ...settings, quoteCompanies });

    return NextResponse.json({ success: true, quote: { ...quote, companyId: targetComp } });
  } catch (error: any) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: error?.message || "Error al crear la cotización" },
      { status: 400 }
    );
  }
}

