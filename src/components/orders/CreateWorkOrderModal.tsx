"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  X,
  Plus,
  Package,
  Trash2,
  AlertCircle,
  Search,
  Camera,
  Tag,
} from "lucide-react";
import { CameraScannerModal } from "@/components/common/CameraScannerModal";

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
  products: any[];
}

export function CreateWorkOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
  products,
}: CreateWorkOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [motoModel, setMotoModel] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [partQty, setPartQty] = useState("1");
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>("");
  const [partsList, setPartsList] = useState<any[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RESETEAR DATOS AL ABRIR: No guarda datos de la orden anterior
  useEffect(() => {
    if (isOpen) {
      setCustomerName("");
      setCustomerPhone("");
      setPlate("");
      setMotoModel("");
      setDiagnosis("");
      setSearchTerm("");
      setSelectedProduct(null);
      setPartQty("1");
      setNegotiatedPrice("");
      setPartsList([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrado de repuestos por texto con la lupa
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

  const handleAddPart = () => {
    if (!selectedProduct) {
      setError("Por favor busca y selecciona un repuesto primero");
      return;
    }

    const qty = Number(partQty) || 1;
    if (selectedProduct.currentStock < qty) {
      setError(
        `Stock insuficiente para "${selectedProduct.name}". Disponible: ${selectedProduct.currentStock} unidades.`
      );
      return;
    }
    setError(null);

    const unitPrice =
      negotiatedPrice && !isNaN(Number(negotiatedPrice)) && Number(negotiatedPrice) >= 0
        ? Number(negotiatedPrice)
        : selectedProduct.salePrice;

    const existingIndex = partsList.findIndex((i) => i.productId === selectedProduct.id);
    if (existingIndex > -1) {
      const updated = [...partsList];
      const newQty = updated[existingIndex].quantity + qty;
      if (selectedProduct.currentStock < newQty) {
        setError(`No puedes agregar más. Stock disponible: ${selectedProduct.currentStock}`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].unitPrice = unitPrice;
      updated[existingIndex].total = newQty * unitPrice;
      setPartsList(updated);
    } else {
      setPartsList((prev) => [
        ...prev,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          quantity: qty,
          regularPrice: selectedProduct.salePrice,
          unitPrice,
          total: unitPrice * qty,
        },
      ]);
    }

    setSelectedProduct(null);
    setPartQty("1");
    setNegotiatedPrice("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          plate: plate.toUpperCase().trim(),
          motoModel,
          diagnosis: diagnosis || "Despacho de repuestos para vehículo",
          laborCost: 0,
          parts: partsList.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la asignación");

      onOrderCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar la asignación de repuestos");
    } finally {
      setLoading(false);
    }
  };

  const totalPartsCost = partsList.reduce((acc, p) => acc + p.total, 0);

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
              <div className="flex items-center gap-2 text-[#34D399]">
                <Package className="w-5 h-5" />
                <CardTitle>Asignación de Repuestos a Motocicleta</CardTitle>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Registra la moto y agrega los repuestos que se le van colocando en el taller.
              </p>
            </CardHeader>

            <CardContent className="pt-4 max-h-[calc(85vh-120px)] overflow-y-auto pr-2">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Datos del Cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                      Cliente *
                    </label>
                    <Input
                      required
                      placeholder="Nombre del cliente"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                      Teléfono
                    </label>
                    <Input
                      placeholder="Ej. 300 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Datos de la Moto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                      Placa de la Moto *
                    </label>
                    <Input
                      required
                      placeholder="Ej. ABC12D"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      className="font-mono uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                      Línea / Modelo *
                    </label>
                    <Input
                      required
                      placeholder="Ej. Boxer CT 100, NKD 125"
                      value={motoModel}
                      onChange={(e) => setMotoModel(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notas / Observaciones */}
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                    Detalle / Observaciones del Trabajo
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 text-sm text-[#F3F4F6] placeholder-[#9CA3AF]/60 bg-white/[0.04] border border-white/[0.12] rounded-lg focus:outline-none focus:border-[#5AA9E6]/80"
                    placeholder="Ej. Mantenimiento general, cambio de kit de arrastre..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                {/* Repuestos a Asignar */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#34D399] uppercase tracking-wider block">
                      Buscar Repuestos para la Moto
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
                      placeholder="Escribe: Boxer, NKD, pastilla, kit, filtro..."
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
                                {p.sku} · Moto:{" "}
                                <span className="text-[#22D3EE]">{p.motorcycleFit || "Universal"}</span>
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

                  {selectedProduct && (
                    <div className="p-3 rounded-lg bg-white/[0.05] border border-white/[0.1] space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {selectedProduct.name}
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">
                            Stock: <b className="text-[#34D399]">{selectedProduct.currentStock}</b> — Catálogo: ${selectedProduct.salePrice.toLocaleString("es-CO")} COP
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

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] text-[#9CA3AF] block mb-0.5">Cantidad</label>
                          <Input
                            type="number"
                            min="1"
                            max={selectedProduct.currentStock}
                            value={partQty}
                            onChange={(e) => setPartQty(e.target.value)}
                            className="text-center h-9 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#22D3EE] font-semibold flex items-center gap-1 mb-0.5">
                            <Tag className="w-3 h-3" />
                            Precio Cobrado ($)
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

                      {Number(negotiatedPrice) < selectedProduct.salePrice && (
                        <div className="text-[11px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded flex items-center justify-between">
                          <span>Rebaja negociada:</span>
                          <b>
                            -${(selectedProduct.salePrice - Number(negotiatedPrice)).toLocaleString("es-CO")} COP
                          </b>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddPart}
                          className="w-full h-9 font-bold text-xs"
                        >
                          <Plus className="w-4 h-4 mr-1 text-[#34D399]" />
                          Asignar a esta Moto
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de Repuestos Asignados */}
                {partsList.length > 0 ? (
                  <div className="space-y-1.5 border border-white/[0.08] rounded-xl p-3 bg-white/[0.02]">
                    <span className="text-xs font-medium text-[#9CA3AF] block mb-2">
                      Repuestos puestos a esta moto ({partsList.length})
                    </span>
                    {partsList.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 border-b border-white/[0.04] text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{p.name}</span>
                          <span className="text-[#9CA3AF]">
                            {p.quantity} x ${p.unitPrice.toLocaleString("es-CO")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            ${p.total.toLocaleString("es-CO")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPartsList(partsList.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between items-center text-sm font-bold text-white">
                      <span>Total Repuestos:</span>
                      <span className="text-[#34D399] tabular-nums">
                        ${totalPartsCost.toLocaleString("es-CO")} COP
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-[#9CA3AF] border border-dashed border-white/[0.1] rounded-xl">
                    Aún no has agregado repuestos a esta moto.
                  </div>
                )}

                {/* Botones de acción */}
                <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3 sticky bottom-0 bg-[#13161F] py-2">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} variant="primary" className="px-6 font-bold">
                    {loading ? "Guardando..." : "Crear Asignación de Moto"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Cámara */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleBarcodeScan}
        title="Escanear Repuesto para Asignar"
      />
    </>
  );
}
