"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  X,
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  Camera,
  Tag,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { CameraScannerModal } from "@/components/common/CameraScannerModal";
import { useBarcodeScanner } from "@/features/scanner/useBarcodeScanner";
import { playScanBeep } from "@/lib/sound";

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated: (createdInvoice?: any) => void;
  products: any[];
  companyId?: string;
  initialProduct?: any;
}

export function CreateSaleModal({
  isOpen,
  onClose,
  onSaleCreated,
  products,
  companyId,
  initialProduct,
}: CreateSaleModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [paymentType, setPaymentType] = useState<"EFECTIVO" | "TRANSFERENCIA" | "CREDITO">("EFECTIVO");
  const [globalDiscount, setGlobalDiscount] = useState<string>("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RESETEAR DATOS O CARGAR PRODUCTO INICIAL AL ABRIR
  useEffect(() => {
    if (isOpen) {
      if (initialProduct && initialProduct.currentStock > 0) {
        setCart([
          {
            productId: initialProduct.id,
            name: initialProduct.name,
            sku: initialProduct.sku,
            regularPrice: initialProduct.salePrice,
            unitPrice: initialProduct.salePrice,
            discount: 0,
            quantity: 1,
            total: initialProduct.salePrice,
          },
        ]);
        playScanBeep(true);
      } else {
        setCart([]);
      }
      setCustomerName("");
      setCustomerPhone("");
      setPlate("");
      setSearchTerm("");
      setSelectedProduct(null);
      setQuantity("1");
      setNegotiatedPrice("");
      setGlobalDiscount("");
      setPaymentType("EFECTIVO");
      setError(null);
    }
  }, [isOpen, initialProduct]);

  // Escáner de pistola láser directo dentro del modal de venta
  useBarcodeScanner({
    enabled: isOpen && !isCameraOpen,
    onScan: (barcode) => {
      handleBarcodeScan(barcode);
    },
  });

  if (!isOpen) return null;

  // Filtrar repuestos en tiempo real por nombre, SKU, código de barras o compatibilidad de moto
  const filteredProducts = searchTerm.trim()
    ? products
        .filter((p) => {
          const term = searchTerm.toLowerCase();
          return (
            p.name.toLowerCase().includes(term) ||
            p.sku.toLowerCase().includes(term) ||
            (p.barcode && p.barcode.toLowerCase().includes(term)) ||
            (p.motorcycleFit && p.motorcycleFit.toLowerCase().includes(term))
          );
        })
        .slice(0, 8)
    : [];

  const handleSelectProduct = (prod: any) => {
    setSelectedProduct(prod);
    setNegotiatedPrice(String(prod.salePrice));
    setSearchTerm("");
    setError(null);
  };

  // Agregar directamente al carrito con pistola o cámara
  const addProductDirectlyToCart = (prod: any) => {
    if (prod.currentStock <= 0) {
      setError(`"${prod.name}" no tiene existencias disponibles (Stock: 0).`);
      playScanBeep(false);
      return;
    }

    const existingIndex = cart.findIndex((i) => i.productId === prod.id);
    if (existingIndex > -1) {
      const currentInCart = cart[existingIndex].quantity;
      if (currentInCart >= prod.currentStock) {
        setError(
          `Stock máximo alcanzado para "${prod.name}" (${prod.currentStock} unidades disponibles).`
        );
        playScanBeep(false);
        return;
      }
      const updated = [...cart];
      const newQty = currentInCart + 1;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].total = newQty * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          sku: prod.sku,
          regularPrice: prod.salePrice,
          unitPrice: prod.salePrice,
          discount: 0,
          quantity: 1,
          total: prod.salePrice,
        },
      ]);
    }

    playScanBeep(true);
    setSearchTerm("");
    setSelectedProduct(null);
    setError(null);
  };

  const handleBarcodeScan = (barcode: string) => {
    const clean = barcode.trim();
    if (!clean) return;

    // Buscar repuesto por código de barras o SKU exacto
    const found = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === clean.toLowerCase()) ||
        p.sku.toLowerCase() === clean.toLowerCase()
    );

    if (found) {
      addProductDirectlyToCart(found);
    } else {
      setSearchTerm(clean);
      setError(`Código "${clean}" no encontrado en el catálogo de esta empresa.`);
      playScanBeep(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      setError("Por favor busca y selecciona un repuesto primero");
      return;
    }

    const qty = Number(quantity) || 1;
    if (selectedProduct.currentStock < qty) {
      setError(
        `Stock insuficiente. Solo quedan ${selectedProduct.currentStock} unidades disponibles de "${selectedProduct.name}".`
      );
      return;
    }

    // Precio acordado / negociado sin tocar el catálogo
    const unitPrice =
      negotiatedPrice && !isNaN(Number(negotiatedPrice)) && Number(negotiatedPrice) >= 0
        ? Number(negotiatedPrice)
        : selectedProduct.salePrice;

    setError(null);

    const existingIndex = cart.findIndex((i) => i.productId === selectedProduct.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + qty;
      if (selectedProduct.currentStock < newQty) {
        setError(`No puedes agregar más. Stock máximo: ${selectedProduct.currentStock}`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].unitPrice = unitPrice;
      updated[existingIndex].total = newQty * unitPrice;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          regularPrice: selectedProduct.salePrice,
          unitPrice,
          discount: Math.max(0, selectedProduct.salePrice - unitPrice),
          quantity: qty,
          total: unitPrice * qty,
        },
      ]);
    }

    setSelectedProduct(null);
    setQuantity("1");
    setNegotiatedPrice("");
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotalCart = cart.reduce((sum, item) => sum + item.total, 0);
  const extraDiscount = Number(globalDiscount) > 0 ? Math.min(Number(globalDiscount), subtotalCart) : 0;
  const finalTotal = Math.max(0, subtotalCart - extraDiscount);

  const totalRegular = cart.reduce(
    (sum, item) => sum + (item.regularPrice || item.unitPrice) * item.quantity,
    0
  );
  const totalDiscount = Math.max(0, totalRegular - finalTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Agregue al menos un repuesto a la venta");
      return;
    }

    if (paymentType === "CREDITO" && !customerName.trim()) {
      setError("Para ventas a Crédito / Fiado, el nombre del cliente es obligatorio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Si hay descuento global a la factura, distribuirlo proporcionalmente en los items
      const discountRatio = subtotalCart > 0 ? (subtotalCart - extraDiscount) / subtotalCart : 1;

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId || undefined,
          customerName: customerName || "Consumidor Final",
          customerPhone: customerPhone || undefined,
          plate: plate ? plate.toUpperCase() : undefined,
          paymentType,
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: Math.round(i.unitPrice * discountRatio),
            taxRate: 19,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar la venta");

      onSaleCreated(data.invoice);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 md:p-10 flex justify-center items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-lg my-auto">
          <Card strong className="border-white/20 shadow-2xl relative bg-[#13161F]">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white p-2 rounded-lg hover:bg-white/[0.08] cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <CardHeader className="pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-[#5AA9E6]">
                <ShoppingCart className="w-5 h-5" />
                <CardTitle>Venta de Repuestos (POS)</CardTitle>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Facturación en mostrador, precios negociables, ventas a crédito y ticket térmico.
              </p>
            </CardHeader>

            <CardContent className="pt-4 max-h-[calc(85vh-120px)] overflow-y-auto pr-2">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Datos del Cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                      Cliente {paymentType === "CREDITO" && <span className="text-red-400">*</span>}
                    </label>
                    <Input
                      placeholder="Nombre del Cliente"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                      Teléfono {paymentType === "CREDITO" && "(Recomendado)"}
                    </label>
                    <Input
                      placeholder="Ej. 300 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Búsqueda de repuesto por lupa o cámara del celular */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#22D3EE] uppercase tracking-wider block">
                      Buscar Repuesto
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5AA9E6]/15 border border-[#5AA9E6]/40 text-[#5AA9E6] hover:bg-[#5AA9E6] hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                      title="Abrir cámara del celular para escanear código de barras"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Escanear Cámara
                    </button>
                  </div>

                  {/* Input de búsqueda con lupa */}
                  <div className="relative">
                    <Input
                      icon={<Search className="w-4 h-4 text-[#22D3EE]" />}
                      placeholder="Escribe: Boxer, NKD, pastilla, kit, aceite o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Resultados de búsqueda */}
                    {filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#1a1d28] border border-white/[0.15] shadow-2xl divide-y divide-white/[0.06]">
                        {filteredProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="p-2.5 hover:bg-white/[0.08] cursor-pointer text-xs transition-colors flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-white">{p.name}</div>
                              <div className="text-[#9CA3AF] text-[11px]">
                                {p.sku} · Moto:{" "}
                                <span className="text-[#22D3EE]">
                                  {p.motorcycleFit || "Universal"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 pl-2">
                              <span className="font-bold text-[#5AA9E6] block">
                                ${p.salePrice.toLocaleString("es-CO")}
                              </span>
                              <span className="text-[10px] text-[#34D399]">
                                Stock: {p.currentStock}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Producto seleccionado para agregar (Con precio negociable) */}
                  {selectedProduct ? (
                    <div className="p-3 rounded-lg bg-white/[0.05] border border-white/[0.1] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {selectedProduct.name}
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">
                            Stock disponible:{" "}
                            <b className="text-[#34D399]">{selectedProduct.currentStock} unids</b> ·
                            Precio Catálogo:{" "}
                            <b className="text-white">
                              ${selectedProduct.salePrice.toLocaleString("es-CO")} COP
                            </b>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(null)}
                          className="text-[#9CA3AF] hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Cantidad y Precio Acordado */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] text-[#9CA3AF] block mb-0.5">Cantidad</label>
                          <Input
                            type="number"
                            min="1"
                            max={selectedProduct.currentStock}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="text-center h-9 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#22D3EE] font-semibold flex items-center gap-1 mb-0.5">
                            <Tag className="w-3 h-3" />
                            Precio Venta / Acordado ($)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            value={negotiatedPrice}
                            onChange={(e) => setNegotiatedPrice(e.target.value)}
                            placeholder={String(selectedProduct.salePrice)}
                            className="h-9 font-bold text-[#34D399]"
                          />
                        </div>
                      </div>

                      {/* Notificación si hay descuento */}
                      {Number(negotiatedPrice) < selectedProduct.salePrice && (
                        <div className="text-[11px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded flex items-center justify-between">
                          <span>Rebaja negociada con cliente:</span>
                          <b>
                            -$
                            {(
                              selectedProduct.salePrice - Number(negotiatedPrice)
                            ).toLocaleString("es-CO")}{" "}
                            COP / unid
                          </b>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddToCart}
                        className="w-full h-9 font-bold text-xs"
                      >
                        <Plus className="w-4 h-4 mr-1 text-[#34D399]" />
                        Agregar al Carrito de Venta
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#9CA3AF] italic">
                      Busca un repuesto o usa la cámara para seleccionarlo y ajustar precio si aplica.
                    </p>
                  )}
                </div>

                {/* Carrito de productos agregados */}
                {cart.length > 0 ? (
                  <div className="space-y-1.5 border border-white/[0.08] rounded-xl p-3 bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-[#9CA3AF]">
                        Repuestos a Facturar ({cart.length})
                      </span>
                      {totalDiscount > 0 && (
                        <span className="text-[11px] text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded">
                          Descuento total: -${totalDiscount.toLocaleString("es-CO")} COP
                        </span>
                      )}
                    </div>

                    {cart.map((item, idx) => {
                      const isDiscounted = item.unitPrice < item.regularPrice;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b border-white/[0.04] text-xs gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-white block truncate">{item.name}</span>
                            <div className="text-[11px] text-[#9CA3AF] flex items-center gap-1.5 flex-wrap">
                              <span>
                                {item.quantity} x ${item.unitPrice.toLocaleString("es-CO")}
                              </span>
                              {isDiscounted && (
                                <span className="line-through text-gray-500">
                                  ${item.regularPrice.toLocaleString("es-CO")}
                                </span>
                              )}
                              {isDiscounted && (
                                <span className="text-yellow-400 text-[10px] font-semibold">
                                  (-${(item.regularPrice - item.unitPrice).toLocaleString("es-CO")})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-white tabular-nums">
                              ${item.total.toLocaleString("es-CO")}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(idx)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/[0.08] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-3 border-t border-white/[0.08] space-y-2">
                      {/* Descuento global a la factura */}
                      <div className="bg-[#1F3A5F]/30 p-2.5 rounded-lg border border-[#5AA9E6]/30">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs text-[#EAF4F4] font-medium flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#5AA9E6]" />
                            Descuento extra a la factura ($ COP):
                          </label>
                          <div className="w-32">
                            <Input
                              type="number"
                              min="0"
                              max={subtotalCart}
                              step="500"
                              placeholder="0"
                              value={globalDiscount}
                              onChange={(e) => setGlobalDiscount(e.target.value)}
                              className="text-right text-xs py-1 h-7 bg-[#222831]/80 text-[#5AA9E6] font-semibold border-white/20"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Desglose de totales */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-[#9CA3AF]">
                          <span>Subtotal de repuestos:</span>
                          <span className="tabular-nums">${subtotalCart.toLocaleString("es-CO")} COP</span>
                        </div>

                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-yellow-400 font-semibold">
                            <span>Descuento total aplicado:</span>
                            <span className="tabular-nums">-${totalDiscount.toLocaleString("es-CO")} COP</span>
                          </div>
                        )}

                        <div className="pt-1 flex justify-between items-center text-sm font-bold text-white border-t border-white/[0.06]">
                          <span>Total a Cobrar:</span>
                          <span className="text-[#34D399] tabular-nums text-base">
                            ${finalTotal.toLocaleString("es-CO")} COP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#9CA3AF] border border-dashed border-white/[0.1] rounded-xl">
                    Aún no has agregado repuestos a la venta.
                  </div>
                )}

                {/* Medio de Pago: Efectivo, Transferencia o Crédito */}
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                    Método de Pago:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "EFECTIVO", label: "Efectivo" },
                      { id: "TRANSFERENCIA", label: "Transferencia" },
                      { id: "CREDITO", label: "A Crédito (Fiado)" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentType(m.id as any)}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer text-center ${
                          paymentType === m.id
                            ? m.id === "CREDITO"
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                              : "bg-[#5AA9E6]/20 border-[#5AA9E6] text-white shadow-sm"
                            : "bg-white/[0.03] border-white/[0.08] text-[#9CA3AF] hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {paymentType === "CREDITO" && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Venta a Crédito / Fiado</span>
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        Esta venta se registrará en el <b>Módulo de Créditos</b>. El cliente podrá
                        hacer abonos parciales o liquidar la deuda posteriormente.
                      </p>
                      <div>
                        <label className="text-[10px] text-amber-300 block mb-0.5">
                          Placa de la Moto (Opcional):
                        </label>
                        <Input
                          placeholder="Ej. ABC12D"
                          value={plate}
                          onChange={(e) => setPlate(e.target.value.toUpperCase())}
                          className="h-8 text-xs font-mono uppercase bg-black/40 border-amber-500/30"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón Cobrar */}
                <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3 sticky bottom-0 bg-[#13161F] py-2">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    variant={paymentType === "CREDITO" ? "secondary" : "primary"}
                    className={`px-6 font-bold ${
                      paymentType === "CREDITO"
                        ? "bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500 hover:text-black"
                        : ""
                    }`}
                  >
                    {loading
                      ? "Procesando..."
                      : paymentType === "CREDITO"
                      ? `Registrar Crédito ($${finalTotal.toLocaleString("es-CO")})`
                      : `Cobrar $${finalTotal.toLocaleString("es-CO")} COP`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Cámara para Escanear Código de Barras */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleBarcodeScan}
        title="Escanear Repuesto para Venta"
      />
    </>
  );
}
