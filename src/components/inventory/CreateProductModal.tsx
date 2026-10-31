"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { X, Plus, Package, Camera, Barcode } from "lucide-react";
import { CameraScannerModal } from "@/components/common/CameraScannerModal";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
  initialBarcode?: string;
}

export function CreateProductModal({
  isOpen,
  onClose,
  onProductCreated,
  initialBarcode = "",
}: CreateProductModalProps) {
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState(initialBarcode);
  const [name, setName] = useState("");
  const [motorcycleFit, setMotorcycleFit] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [initialStock, setInitialStock] = useState("1");
  const [minStock, setMinStock] = useState("3");
  const [shelf, setShelf] = useState("E-01");
  const [level, setLevel] = useState("1");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleBarcodeScanned = (scannedCode: string) => {
    setBarcode(scannedCode);
    if (!sku) {
      setSku(scannedCode);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          barcode: barcode || undefined,
          name,
          motorcycleFit: motorcycleFit || undefined,
          costPrice: Number(costPrice) || 0,
          salePrice: Number(salePrice) || 0,
          initialStock: Number(initialStock) || 0,
          minStock: Number(minStock) || 3,
          shelf,
          level: Number(level) || 1,
          position: position || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear producto");
      }

      onProductCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar repuesto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md p-4 sm:p-6 md:p-10 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg my-auto">
        <Card strong className="border-white/20 shadow-2xl relative bg-[#13161F]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white p-2 rounded-lg hover:bg-white/[0.08] cursor-pointer transition-colors z-10"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <CardHeader className="pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-[#5AA9E6]">
              <Package className="w-5 h-5" />
              <CardTitle>Registrar Nuevo Repuesto</CardTitle>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Ingrese los datos y la ubicación física en estantería para despacho rápido.
            </p>
          </CardHeader>

          <CardContent className="pt-4 max-h-[calc(85vh-120px)] overflow-y-auto pr-2">
            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-[#F87171]/15 border border-[#F87171]/30 text-xs text-[#F87171]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium block mb-1">SKU (Código) *</label>
                  <Input
                    required
                    placeholder="Ej. PAST-DEL-YBR"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-[#9CA3AF] font-medium">Código de Barras</label>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="text-[11px] text-[#5AA9E6] hover:text-[#EAF4F4] flex items-center gap-1 font-semibold cursor-pointer transition-colors bg-[#1F3A5F]/40 hover:bg-[#1F3A5F] px-2 py-0.5 rounded-md border border-[#5AA9E6]/30"
                    >
                      <Camera className="w-3 h-3 text-[#5AA9E6]" />
                      <span>Escanear con Cámara</span>
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Escanear pistola o cámara..."
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsCameraOpen(true)}
                      title="Abrir cámara del celular para escanear"
                      className="shrink-0 px-2.5 h-10 border-[#5AA9E6]/40"
                    >
                      <Camera className="w-4 h-4 text-[#5AA9E6]" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#9CA3AF] font-medium block mb-1">Nombre del Repuesto *</label>
                <Input
                  required
                  placeholder="Ej. Pastillas de freno delanteras"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-[#9CA3AF] font-medium block mb-1">Motos Compatibles</label>
                <Input
                  placeholder="Ej. Yamaha YBR 125, Libero 125"
                  value={motorcycleFit}
                  onChange={(e) => setMotorcycleFit(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium block mb-1">Costo Compra (COP) *</label>
                  <Input
                    type="number"
                    required
                    placeholder="Ej. 18000"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium block mb-1">Precio Venta (COP) *</label>
                  <Input
                    type="number"
                    required
                    placeholder="Ej. 32000"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Ubicación Física */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                <span className="text-xs font-semibold text-[#22D3EE] uppercase tracking-wider block">
                  Ubicación Física en Taller
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">Estante</label>
                    <Input
                      required
                      placeholder="E-01"
                      value={shelf}
                      onChange={(e) => setShelf(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">Nivel</label>
                    <Input
                      type="number"
                      required
                      placeholder="1"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">Posición</label>
                    <Input
                      placeholder="P-02"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium block mb-1">Stock Inicial</label>
                  <Input
                    type="number"
                    required
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] font-medium block mb-1">Stock Mínimo</label>
                  <Input
                    type="number"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                  />
                </div>
              </div>

              {/* Botones de acción siempre visibles */}
              <div className="pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-end gap-3 sticky bottom-0 bg-[#13161F] py-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="px-4 text-[#9CA3AF] hover:text-white"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  variant="primary"
                  className="px-6 py-2.5 font-bold shadow-xl shadow-[#5AA9E6]/30 text-white bg-[#5AA9E6] hover:bg-[#468ec7]"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {loading ? "Guardando..." : "Guardar Repuesto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleBarcodeScanned}
        title="Escanear Código de Barras del Nuevo Repuesto"
      />
    </div>
  );
}
