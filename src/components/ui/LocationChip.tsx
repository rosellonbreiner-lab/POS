import * as React from "react";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface LocationChipProps extends React.HTMLAttributes<HTMLDivElement> {
  bodega?: string;
  estante: string;
  nivel: number | string;
  posicion?: string;
  onClick?: () => void;
}

export function LocationChip({
  bodega,
  estante,
  nivel,
  posicion,
  onClick,
  className,
  ...props
}: LocationChipProps) {
  // Evitar duplicar "P" si posicion ya viene como "PA-1" o "P1"
  const formattedPos = posicion
    ? posicion.startsWith("P") || posicion.startsWith("p")
      ? posicion
      : `P${posicion}`
    : null;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
        "bg-[#5AA9E6]/10 border border-[#5AA9E6]/30 text-[#5AA9E6]",
        "font-mono text-xs font-semibold tabular-nums shadow-sm select-none",
        onClick && "cursor-pointer hover:bg-[#5AA9E6]/25 hover:border-[#5AA9E6] hover:text-white transition-all active:scale-95",
        className
      )}
      title={bodega ? `Bodega: ${bodega} (Clic para ver mapa de ubicación)` : "Clic para ver ubicación en estantería"}
      {...props}
    >
      <MapPin className="w-3.5 h-3.5 shrink-0 text-[#5AA9E6]" />
      <span className="whitespace-nowrap font-medium">{estante}</span>
      <span className="opacity-40 whitespace-nowrap">·</span>
      <span className="whitespace-nowrap font-medium">N{nivel}</span>
      {formattedPos && (
        <>
          <span className="opacity-40 whitespace-nowrap">·</span>
          <span className="whitespace-nowrap font-medium">{formattedPos}</span>
        </>
      )}
    </div>
  );
}
