"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Package,
  Search,
  Camera,
  Tag,
} from "lucide-react";
import { CameraScannerModal } from "@/components/common/CameraScannerModal";

interface EditOrderPartsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  products: any[];
}

export function EditOrderPartsModal({
  order,
  isOpen,
  onClose,
  onUpdated,
  products,
}: EditOrderPartsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado para el modal de confirmación elegante
  const [itemToConfirmRemove, setItemToConfirmRemove] = useState<any | null>(null);

  if (!isOpen || !order) return null;

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
    setErrorMsg(null);
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

  const handleExecuteRemove = async () => {
    if (!itemToConfirmRemove) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REMOVE_ITEM", itemId: itemToConfirmRemove.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo quitar el repuesto");

      setSuccessMsg(
        `"${itemToConfirmRemove.product?.name || "Repuesto"}" devuelto al inventario con éxito.`
      );
      setItemToConfirmRemove(null);
      onUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al retirar repuesto");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async () => {
    if (!selectedProduct) return;
    const qty = Number(quantity) || 1;
    if (selectedProduct.currentStock < qty) {
      setErrorMsg(
        `Stock insuficiente. Solo quedan ${selectedProduct.currentStock} unidades disponibles.`
      );
      return;
    }

    const unitPrice =
      negotiatedPrice && !isNaN(Number(negotiatedPrice)) && Number(negotiatedPrice) >= 0
        ? Number(negotiatedPrice)
        : selectedProduct.salePrice;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_ITEM",
          productId: selectedProduct.id,
          quantity: qty,
          unitPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo agregar el repuesto");

      setSuccessMsg(`Se asignó "${selectedProduct.name}" a la motocicleta.`);
      setSelectedProduct(null);
      setQuantity("1");
      setNegotiatedPrice("");
      onUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al agregar repuesto");
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
                <Package className="w-5 h-5" />
                <CardTitle>Repuestos de la Moto #{order.consecutive}</CardTitle>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Placa: <b className="text-white font-mono">{order.motorcycle?.plate}</b> ({order.motorcycle?.model}) · Cliente:{" "}
                <b className="text-white">{order.customer?.name}</b>
              </p>
            </CardHeader>

            <CardContent className="pt-4 max-h-[calc(85vh-120px)] overflow-y-auto pr-2 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 text-xs text-[#34D399] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Repuestos actualmente puestos en la moto */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                  Repuestos Asignados Actualmente ({order.items?.length || 0})
                </span>

                {(!order.items || order.items.length === 0) ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/[0.1] text-center text-xs text-[#9CA3AF]">
                    Esta moto no tiene repuestos asignados todavía.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.15] transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">
                            {item.product?.name || "Repuesto"}
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">
                            {item.quantity} x ${item.unitPrice.toLocaleString("es-CO")} COP ={" "}
                            <b className="text-white">${item.totalPrice.toLocaleString("es-CO")} COP</b>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={loading}
                            onClick={() => setItemToConfirmRemove(item)}
                            className="bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white text-xs h-8 cursor-pointer"
                            title="Quitar repuesto y devolverlo a stock"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Quitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agregar repuesto extra con Lupa y Cámara */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#34D399] uppercase tracking-wider block">
                    + Asignar Otro Repuesto a la Moto
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
                          Disponible en bodega: <b className="text-[#34D399]">{selectedProduct.currentStock}</b> ·
                          Precio Catálogo: ${selectedProduct.salePrice.toLocaleString("es-CO")} COP
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
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
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
                        <span>Descuento acordado para esta moto:</span>
                        <b>
                          -${(selectedProduct.salePrice - Number(negotiatedPrice)).toLocaleString("es-CO")} COP
                        </b>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="primary"
                        disabled={loading}
                        onClick={handleAddPart}
                        className="w-full h-9 font-bold text-xs"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {loading ? "Asignando..." : "Asignar Repuesto a la Moto"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pie de modal */}
              <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center">
                <span className="text-xs text-[#9CA3AF]">
                  Total Repuestos en Moto:{" "}
                  <b className="text-white font-mono text-sm">
                    ${order.total?.toLocaleString("es-CO") || 0} COP
                  </b>
                </span>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Confirmación Elegante para Quitar Repuesto */}
      {itemToConfirmRemove && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm p-4 flex justify-center items-center">
          <div className="w-full max-w-sm bg-[#13161F] border border-red-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">¿Quitar este repuesto?</h4>
                <p className="text-xs text-[#9CA3AF]">
                  Se retirará de la orden y volverá al stock.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
              <div className="font-bold text-white">{itemToConfirmRemove.product?.name}</div>
              <div className="text-[#9CA3AF] mt-1">
                Cantidad a reintegrar: <b className="text-[#34D399]">{itemToConfirmRemove.quantity} unidad(es)</b>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setItemToConfirmRemove(null)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleExecuteRemove}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 font-bold"
              >
                {loading ? "Quitando..." : "Sí, Quitar Repuesto"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cámara */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleBarcodeScan}
        title="Escanear Repuesto para la Moto"
      />
    </>
  );
}
