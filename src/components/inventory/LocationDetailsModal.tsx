"use client";

import { X, MapPin, Layers, Box, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LocationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
}

export function LocationDetailsModal({
  isOpen,
  onClose,
  product,
}: LocationDetailsModalProps) {
  if (!isOpen || !product) return null;

  const loc = product.locations?.[0]?.location;
  const shelf = loc?.shelf || "No especificado";
  const level = loc?.level !== undefined ? loc.level : "1";
  const position = loc?.position || "General";
  const warehouse = loc?.warehouse?.name || "Bodega Principal / Almacén";

  // Niveles del estante para el diagrama visual (niveles 1 al 4 o más)
  const numericLevel = Number(level) || 1;
  const shelfLevels = [4, 3, 2, 1];

  return (
    <div
      className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#222831] border border-[#5AA9E6]/40 rounded-2xl shadow-2xl overflow-hidden text-[#EAF4F4]">
        {/* Header */}
        <div className="bg-[#1F3A5F]/60 p-4 border-b border-[#5AA9E6]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5AA9E6]/20 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                Ubicación Física en Almacén
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Coordenadas de estantería del repuesto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Info del Repuesto */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-[#5AA9E6]">
                {product.sku}
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Stock: <b className="text-white">{product.currentStock} unds</b>
              </span>
            </div>
            <h4 className="font-semibold text-white text-sm mt-1">
              {product.name}
            </h4>
            {product.motorcycleFit && (
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Compatibilidad: <span className="text-[#EAF4F4]">{product.motorcycleFit}</span>
              </p>
            )}
          </div>

          {/* Tarjetas de Coordenadas */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-[#1F3A5F]/30 border border-[#5AA9E6]/30">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">
                Estante
              </span>
              <span className="text-base font-bold text-[#5AA9E6] font-mono mt-0.5 block truncate">
                {shelf}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1F3A5F]/30 border border-[#5AA9E6]/30">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">
                Nivel / Altura
              </span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block truncate">
                Nivel {level}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1F3A5F]/30 border border-[#5AA9E6]/30">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">
                Gaveta / Pos
              </span>
              <span className="text-base font-bold text-[#34D399] font-mono mt-0.5 block truncate">
                {position}
              </span>
            </div>
          </div>

          {/* Representación Visual de la Estantería */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.08] space-y-2">
            <div className="flex justify-between items-center text-xs text-[#94A3B8] font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#5AA9E6]" />
                Visualización de Entrepaños ({shelf})
              </span>
              <span className="text-[10px] text-[#34D399] font-semibold">
                ● Ubicado en Nivel {level}
              </span>
            </div>

            {/* Diagrama de niveles del estante */}
            <div className="space-y-1.5 pt-1">
              {shelfLevels.map((lvl) => {
                const isTargetLevel = lvl === numericLevel;
                return (
                  <div
                    key={lvl}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isTargetLevel
                        ? "bg-[#5AA9E6]/20 border-[#5AA9E6] text-white shadow-md shadow-[#5AA9E6]/20 font-bold"
                        : "bg-white/[0.02] border-white/[0.06] text-[#94A3B8]"
                    }`}
                  >
                    <span className="font-mono text-[11px]">
                      NIVEL {lvl} {lvl === 4 ? "(Superior)" : lvl === 1 ? "(Piso)" : ""}
                    </span>

                    {isTargetLevel ? (
                      <span className="flex items-center gap-1 text-[11px] text-[#5AA9E6] font-semibold">
                        <Box className="w-3.5 h-3.5 text-[#5AA9E6]" />
                        Aquí: Casilla {position}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/20">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mensaje de guía */}
          <div className="text-xs text-[#94A3B8] bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06] flex items-start gap-2">
            <Building2 className="w-4 h-4 text-[#5AA9E6] shrink-0 mt-0.5" />
            <span>
              <b>{warehouse}</b>: Ve al <b>{shelf}</b>, sube al <b>Nivel {level}</b> y busca la casilla <b>{position}</b>.
            </span>
          </div>

          {/* Botón cerrar */}
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full font-semibold text-xs"
          >
            Entendido, Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

