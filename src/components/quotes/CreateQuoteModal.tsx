"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { X, Plus, Trash2, Calculator, AlertCircle, Search, Camera } from "lucide-react";
import { CameraScannerModal } from "@/components/common/CameraScannerModal";

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuoteCreated: (createdQuote?: any) => void;
  products: any[];
  companyId?: string;
}

export function CreateQuoteModal({
  isOpen,
  onClose,
  onQuoteCreated,
  products,
  companyId,
}: CreateQuoteModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [motoModel, setMotoModel] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RESETEAR DATOS AL ABRIR: No guarda datos de cotización anterior
  useEffect(() => {
    if (isOpen) {
      setCustomerName("");
      setCustomerPhone("");
      setPlate("");
      setMotoModel("");
      setSearchTerm("");
      setSelectedProduct(null);
      setItemDescription("");
      setItemPrice("");
      setItemQty("1");
      setItemsList([]);
      setIsCameraOpen(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = searchTerm.trim()
    ? products.filter((p) => {
        const term = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          (p.barcode && p.barcode.toLowerCase().includes(term)) ||
          (p.motorcycleFit && p.motorcycleFit.toLowerCase().includes(term))
        );
      }).slice(0, 8)
    : [];

  const handleSelectProduct = (prod: any) => {
    setSelectedProduct(prod);
    setItemDescription(prod.name);
    setItemPrice(String(prod.salePrice));
    setSearchTerm("");
  };

  const handleBarcodeScan = (barcode: string) => {
    const found = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase()) ||
        p.sku.toLowerCase() === barcode.toLowerCase()
    );
    if (found) {
      handleSelectProduct(found);
    } else {
      setSearchTerm(barcode);
    }
  };

  const handleAddItem = () => {
    if (!itemDescription || !itemPrice) {
      setError("Indica la descripción y precio del repuesto");
      return;
    }
    setError(null);
    const qty = Number(itemQty) || 1;
    const price = Number(itemPrice) || 0;

    setItemsList([
      ...itemsList,
      {
        productId: selectedProduct ? selectedProduct.id : null,
        description: itemDescription,
        quantity: qty,
        unitPrice: price,
        total: qty * price,
      },
    ]);

    setSelectedProduct(null);
    setItemDescription("");
    setItemPrice("");
    setItemQty("1");
  };

  const quoteTotal = itemsList.reduce((sum, i) => sum + i.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsList.length === 0) {
      setError("Agregue al menos un repuesto a la cotización");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          customerName: customerName || "Cliente Cotización",
          customerPhone,
          plate: plate.toUpperCase().trim(),
          motoModel,
          estimatedLabor: 0,
          items: itemsList,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar cotización");

      onQuoteCreated(data.quote);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar cotización");
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
      <div className="w-full max-w-xl my-auto">
        <Card strong className="border-white/20 shadow-2xl relative bg-[#13161F]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white p-2 rounded-lg hover:bg-white/[0.08] cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <CardHeader className="pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-[#22D3EE]">
              <Calculator className="w-5 h-5" />
              <CardTitle>Cotizar Repuestos de Motocicleta</CardTitle>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Calcula el valor exacto de los repuestos que se llevará la motocicleta para el cliente.
            </p>
          </CardHeader>

          <CardContent className="pt-4 max-h-[calc(85vh-120px)] overflow-y-auto pr-2">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cliente y Moto */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <span className="text-xs font-semibold text-[#22D3EE] uppercase tracking-wider block">
                  Cliente & Motocicleta
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9CA3AF] block mb-1">Nombre Cliente *</label>
                    <Input
                      required
                      placeholder="Ej. Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] block mb-1">Teléfono</label>
                    <Input
                      placeholder="Ej. 312 000 0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9CA3AF] block mb-1">Placa Moto (Mayúsculas Automático)</label>
                    <Input
                      placeholder="Ej. XZY45A"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      className="uppercase font-bold tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] block mb-1">Modelo / Referencia</label>
                    <Input
                      placeholder="Ej. Boxer CT 100 / Pulsar 200"
                      value={motoModel}
                      onChange={(e) => setMotoModel(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Agregar Repuestos Estimados con Lupa */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#34D399] uppercase tracking-wider block">
                    Buscar Repuestos de Catálogo
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5AA9E6]/15 border border-[#5AA9E6]/40 text-[#5AA9E6] hover:bg-[#5AA9E6] hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                    title="Escanear con cámara del celular"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Cámara
                  </button>
                </div>

                <div className="relative">
                  <Input
                    icon={<Search className="w-4 h-4 text-[#34D399]" />}
                    placeholder="Escribe: Boxer, NKD, pastilla, kit, aceite, etc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

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
                              {p.sku} · Moto: <span className="text-[#22D3EE]">{p.motorcycleFit || "Universal"}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <span className="font-bold text-white block">
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

                {/* Editor manual / confirmación del ítem */}
                <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] space-y-2">
                  <div>
                    <label className="text-[10px] text-[#9CA3AF] block mb-0.5">Descripción del Repuesto</label>
                    <Input
                      placeholder="Descripción repuesto..."
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="w-24">
                      <label className="text-[10px] text-[#9CA3AF] block mb-0.5">Cantidad</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Cant"
                        value={itemQty}
                        onChange={(e) => setItemQty(e.target.value)}
                        className="text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-[#9CA3AF] block mb-0.5">Precio Unitario ($ COP)</label>
                      <Input
                        type="number"
                        placeholder="$ Valor"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                      />
                    </div>
                    <div className="pt-4">
                      <Button type="button" variant="secondary" onClick={handleAddItem} className="h-9 font-bold">
                        <Plus className="w-4 h-4 mr-1 text-[#34D399]" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>

                {itemsList.length > 0 && (
                  <div className="mt-2 space-y-1.5 border border-white/[0.06] rounded-xl p-2.5 bg-white/[0.02]">
                    <span className="text-[11px] font-semibold text-[#9CA3AF] block mb-1">
                      Repuestos en la Cotización ({itemsList.length}):
                    </span>
                    {itemsList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                      >
                        <span className="text-white font-medium pr-2">
                          {item.quantity}x {item.description}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-[#22D3EE] tabular-nums">
                            ${item.total.toLocaleString("es-CO")} COP
                          </span>
                          <button
                            type="button"
                            onClick={() => setItemsList(itemsList.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Eliminar repuesto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Cotizado (Solo Repuestos) */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] flex justify-between items-center">
                <div>
                  <span className="text-xs text-[#9CA3AF] uppercase tracking-wider block">Total Cotización Repuestos</span>
                  <span className="text-xs text-[#9CA3AF]">
                    {itemsList.length} repuesto(s) listado(s)
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#22D3EE] tabular-nums">
                  ${quoteTotal.toLocaleString("es-CO")} COP
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3 sticky bottom-0 bg-[#13161F] py-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} variant="primary" className="px-6 font-bold">
                  {loading ? "Creando..." : "Guardar Cotización"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Modal de Cámara */}
    <CameraScannerModal
      isOpen={isCameraOpen}
      onClose={() => setIsCameraOpen(false)}
      onScan={handleBarcodeScan}
      title="Escanear Repuesto para Cotizar"
    />
  </>
  );
}
