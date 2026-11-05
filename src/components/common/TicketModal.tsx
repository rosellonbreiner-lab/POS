"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Printer, X, SlidersHorizontal } from "lucide-react";

export interface TicketItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TicketCreditInfo {
  creditConsecutive: number | string;
  previousBalance: number;
  amountPaid: number;
  newBalance: number;
  totalDebt: number;
  receivedBy?: string;
}

export interface TicketData {
  type: "VENTA" | "COTIZACION" | "ORDEN" | "ABONO_CREDITO";
  consecutive: number | string;
  date: string;
  customerName?: string;
  customerPhone?: string;
  plate?: string;
  motoModel?: string;
  items?: TicketItem[];
  total: number;
  paymentType?: string;
  creditInfo?: TicketCreditInfo;
  workshopConfig: {
    name: string;
    slogan?: string;
    nit?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    receiptMessage?: string;
  };
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TicketData | null;
}

type PaperFormat = "TM_U220" | "80MM" | "58MM";

const FORMAT_CONFIGS: Record<PaperFormat, {
  label: string;
  sublabel: string;
  printWidth: string;
  marginLeft: string;
  previewWidthClass: string;
  fontSize: string;
}> = {
  TM_U220: {
    label: "Epson TM-U220 (7.5 cm)",
    sublabel: "Matricial · Ancho 58mm · Margen izq 3.5mm (Anti-corte)",
    printWidth: "58mm",
    marginLeft: "3.5mm",
    previewWidthClass: "max-w-[260px]",
    fontSize: "9.5px",
  },
  "80MM": {
    label: "Térmica 80mm",
    sublabel: "Rollo ancho estándar · Ancho útil 70mm",
    printWidth: "70mm",
    marginLeft: "1mm",
    previewWidthClass: "max-w-[310px]",
    fontSize: "10.5px",
  },
  "58MM": {
    label: "Térmica 58mm",
    sublabel: "Rollo portátil compacto · Ancho útil 46mm",
    printWidth: "46mm",
    marginLeft: "1mm",
    previewWidthClass: "max-w-[220px]",
    fontSize: "9px",
  },
};

export function TicketModal({ isOpen, onClose, data }: TicketModalProps) {
  const [paperFormat, setPaperFormat] = useState<PaperFormat>("TM_U220");
  const [customWidth, setCustomWidth] = useState<string>("58mm");
  const [customMarginLeft, setCustomMarginLeft] = useState<string>("3.5mm");
  const [showAdvancedTuning, setShowAdvancedTuning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedFormat = localStorage.getItem("pos_ticket_paper_format") as PaperFormat;
      if (savedFormat && FORMAT_CONFIGS[savedFormat]) {
        setPaperFormat(savedFormat);
        setCustomWidth(FORMAT_CONFIGS[savedFormat].printWidth);
        setCustomMarginLeft(FORMAT_CONFIGS[savedFormat].marginLeft);
      }
      const savedWidth = localStorage.getItem("pos_ticket_custom_width");
      if (savedWidth) setCustomWidth(savedWidth);
      const savedMargin = localStorage.getItem("pos_ticket_custom_margin");
      if (savedMargin) setCustomMarginLeft(savedMargin);
    }
  }, []);

  const handleSelectFormat = (fmt: PaperFormat) => {
    setPaperFormat(fmt);
    const cfg = FORMAT_CONFIGS[fmt];
    setCustomWidth(cfg.printWidth);
    setCustomMarginLeft(cfg.marginLeft);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_ticket_paper_format", fmt);
      localStorage.setItem("pos_ticket_custom_width", cfg.printWidth);
      localStorage.setItem("pos_ticket_custom_margin", cfg.marginLeft);
    }
  };

  const handleUpdateWidth = (w: string) => {
    setCustomWidth(w);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_ticket_custom_width", w);
    }
  };

  const handleUpdateMargin = (m: string) => {
    setCustomMarginLeft(m);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_ticket_custom_margin", m);
    }
  };

  if (!isOpen || !data) return null;

  const currentConfig = FORMAT_CONFIGS[paperFormat];

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    // Quitar temporalmente document.title para evitar que navegadores impriman título
    const originalTitle = document.title;
    document.title = "";

    window.print();

    // Restaurar título tras enviar a la cola de impresión
    setTimeout(() => {
      document.title = originalTitle;
    }, 800);
  };

  const isQuote = data.type === "COTIZACION";
  const isAbono = data.type === "ABONO_CREDITO";
  const isCreditSale = data.paymentType === "CREDITO";

  let title = `FACTURA POS #${data.consecutive}`;
  if (isQuote) title = `COTIZACIÓN #${data.consecutive}`;
  if (isAbono) title = `ABONO #${data.consecutive}`;

  /**
   * Renderizador del cuerpo del ticket (calibrado para 58mm en rollo de 7.5cm)
   */
  const renderTicketBody = () => (
    <div className="w-full text-black font-mono leading-tight select-text text-left">
      {/* Logo si existe (compacto) */}
      {data.workshopConfig.logoUrl ? (
        <div className="text-center mb-1">
          <img
            src={data.workshopConfig.logoUrl}
            alt="Logo Negocio"
            className="max-h-9 max-w-full mx-auto object-contain"
          />
        </div>
      ) : null}

      {/* Encabezado del Negocio */}
      <div className="text-center space-y-0.5">
        <div className="text-xs font-black tracking-wide uppercase">
          {data.workshopConfig.name || "SISTEMA POS"}
        </div>

        {data.workshopConfig.slogan && (
          <div className="text-[8.5px] text-gray-700 italic truncate">
            {data.workshopConfig.slogan}
          </div>
        )}

        {(data.workshopConfig.nit || data.workshopConfig.phone) && (
          <div className="text-[9px] font-semibold text-gray-900">
            {data.workshopConfig.nit ? `NIT: ${data.workshopConfig.nit}` : ""}
            {data.workshopConfig.nit && data.workshopConfig.phone ? " · " : ""}
            {data.workshopConfig.phone ? `TEL: ${data.workshopConfig.phone}` : ""}
          </div>
        )}

        {data.workshopConfig.address && (
          <div className="text-[8.5px] text-gray-800 truncate">
            {data.workshopConfig.address}
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-1"></div>

      {/* Datos del Documento y Fecha */}
      <div className="flex justify-between items-center text-[9.5px]">
        <span className="font-extrabold uppercase">{title}</span>
        <span className="text-[8.5px] text-gray-700 font-mono">{data.date}</span>
      </div>

      <div className="border-b border-dashed border-black my-1"></div>

      {/* Datos del Cliente y Vehículo */}
      <div className="space-y-0.5 text-[8.5px]">
        <div className="truncate">
          <span className="font-bold">CLIENTE:</span> {data.customerName || "Consumidor Final"}
        </div>
        {data.customerPhone && (
          <div>
            <span className="font-bold">TEL:</span> {data.customerPhone}
          </div>
        )}
        {data.plate && (
          <div className="truncate">
            <span className="font-bold">MOTO/PLACA:</span> {data.plate}{" "}
            {data.motoModel ? `(${data.motoModel})` : ""}
          </div>
        )}
        {data.paymentType && (
          <div>
            <span className="font-bold">PAGO:</span> {data.paymentType}
            {isCreditSale && <b className="ml-1 text-red-600">(CRÉDITO)</b>}
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-1"></div>

      {/* CASO 1: TICKET DE ABONO A CRÉDITO */}
      {isAbono && data.creditInfo ? (
        <div className="space-y-1 py-0.5 text-[8.5px]">
          <div className="font-bold text-center text-[9px] bg-gray-100 py-0.5">
            DETALLE DEL ABONO
          </div>
          <div className="flex justify-between">
            <span>Crédito Ref:</span>
            <span className="font-bold">#CRE-{data.creditInfo.creditConsecutive}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Inicial:</span>
            <span>${data.creditInfo.totalDebt.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between">
            <span>Saldo Anterior:</span>
            <span className="font-semibold">${data.creditInfo.previousBalance.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between font-bold text-[9.5px] border-t border-b border-dashed border-black py-0.5">
            <span>VALOR ABONADO:</span>
            <span>${data.creditInfo.amountPaid.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between font-extrabold text-[10px] pt-0.5">
            <span>NUEVO SALDO:</span>
            <span>
              {data.creditInfo.newBalance === 0
                ? "*** PAZ Y SALVO ***"
                : `$${data.creditInfo.newBalance.toLocaleString("es-CO")}`}
            </span>
          </div>
          {data.creditInfo.receivedBy && (
            <div className="text-[8px] text-gray-700 text-right">
              Atendido por: {data.creditInfo.receivedBy}
            </div>
          )}
        </div>
      ) : (
        /* CASO 2: VENTA / COTIZACIÓN CON ARTÍCULOS */
        <>
          {/* Tabla de Artículos: 48% descripción, 16% cant, 36% total (Ajustada para que no corte a la derecha) */}
          <div className="text-[8.5px]">
            <div className="flex justify-between font-bold border-b border-black pb-0.5 mb-1">
              <span className="w-[48%]">DESCRIPCIÓN</span>
              <span className="w-[16%] text-center">CANT</span>
              <span className="w-[36%] text-right">TOTAL</span>
            </div>

            <div className="space-y-1">
              {(data.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start leading-tight">
                  <div className="w-[48%] pr-1">
                    <div className="font-semibold break-words leading-tight">{item.name}</div>
                    <div className="text-[7.5px] text-gray-600 font-mono">
                      ${item.unitPrice.toLocaleString("es-CO")}
                    </div>
                  </div>
                  <div className="w-[16%] text-center font-mono">{item.quantity}</div>
                  <div className="w-[36%] text-right font-semibold font-mono">
                    ${item.total.toLocaleString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b border-dashed border-black my-1"></div>

          {/* Total General */}
          <div className="space-y-0.5 text-right text-[9px]">
            <div className="flex justify-between font-extrabold text-[10.5px] border-t border-b border-black py-0.5">
              <span>TOTAL A PAGAR:</span>
              <span>${data.total.toLocaleString("es-CO")}</span>
            </div>
          </div>
        </>
      )}

      <div className="border-b border-dashed border-black my-1"></div>

      {/* Firmas si es crédito o abono */}
      {(isAbono || isCreditSale) && (
        <div className="pt-2 pb-1 space-y-3 text-[8px] text-center">
          <div>
            <div className="border-t border-black w-32 mx-auto pt-0.5 font-semibold">
              Firma del Cliente
            </div>
            <div className="text-gray-600 text-[7.5px]">Acepto y reconozco la deuda</div>
          </div>
        </div>
      )}

      {/* Pie de Página */}
      <div className="text-center text-[8px] space-y-0.5 text-gray-700 pt-0.5">
        <div>
          {data.workshopConfig.receiptMessage || "¡Gracias por su compra! Vuelva pronto."}
        </div>
        {isQuote && (
          <div className="italic text-[7px] text-gray-600">
            * Cotización informativa sujeta a disponibilidad de stock.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 
        CALIBRACIÓN EXACTA EPSON TM-U220 CON ROLLO DE 7.5 CM:
        - Margen Izquierdo: 3.5mm (salta el borde mecánico de inicio de cabezal)
        - Ancho: 58mm (termina antes del borde mecánico derecho del rodillo de 75mm)
        - @page margin 0: Cero espacios en blanco arriba y abajo
      */}
      <style jsx global>{`
        @page {
          margin: 0 !important;
          size: auto;
        }

        #pos-print-portal {
          display: none;
        }

        @media print {
          @page {
            margin: 0 !important;
            size: auto;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: fit-content !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          body > *:not(#pos-print-portal) {
            display: none !important;
          }

          #pos-print-portal {
            display: block !important;
            position: static !important;
            margin: 0 !important;
            margin-left: ${customMarginLeft} !important;
            padding: 0 1mm !important;
            width: ${customWidth} !important;
            max-width: ${customWidth} !important;
            height: auto !important;
            min-height: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: ${currentConfig.fontSize} !important;
            line-height: 1.15 !important;
            font-family: 'Courier New', Courier, 'Lucida Console', monospace !important;
            overflow: hidden !important;
          }

          #pos-print-portal * {
            box-sizing: border-box !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* PORTAL DE IMPRESIÓN FÍSICA: En la raíz del body para no estar condicionado por el modal centrado */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div id="pos-print-portal">
          {renderTicketBody()}
        </div>,
        document.body
      )}

      {/* VISTA PREVIA EN PANTALLA */}
      <div className="fixed inset-0 z-70 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4 flex justify-center items-center no-print">
        <div className="w-full max-w-md my-auto relative space-y-3">
          {/* Barra de Controles Superior */}
          <div className="bg-[#13161F] p-3 rounded-2xl border border-white/[0.12] space-y-2.5 shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-bold">
                <Printer className="w-4 h-4 text-[#5AA9E6]" />
                <span>Impresión de Ticket POS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="primary" onClick={handlePrint} className="font-bold text-xs h-8">
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Imprimir Ticket
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose} className="p-1 h-8 w-8 text-[#94A3B8] hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Selector de Rollo / Impresora */}
            <div className="pt-2 border-t border-white/[0.08] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Perfil de Impresora:</span>
                <button
                  type="button"
                  onClick={() => setShowAdvancedTuning(!showAdvancedTuning)}
                  className="text-[#5AA9E6] hover:underline flex items-center gap-1 text-[10px] cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  {showAdvancedTuning ? "Ocultar Calibración" : "Ajuste Fino de Margen"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(FORMAT_CONFIGS) as PaperFormat[]).map((fmt) => {
                  const cfg = FORMAT_CONFIGS[fmt];
                  const active = paperFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => handleSelectFormat(fmt)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all border text-left cursor-pointer ${
                        active
                          ? "bg-[#5AA9E6]/20 border-[#5AA9E6] text-[#5AA9E6] shadow-sm font-bold"
                          : "bg-white/[0.02] border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="truncate font-bold">{cfg.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Panel de Ajuste Fino (Permite ajustar margen izq y ancho al milímetro) */}
              {showAdvancedTuning && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-[#5AA9E6]/30 text-[10px] space-y-2 mt-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Margen Izquierdo (Mueve el texto a la derecha):</span>
                    <div className="flex gap-1">
                      {["2mm", "3.5mm", "5mm", "6mm"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleUpdateMargin(m)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            customMarginLeft === m
                              ? "bg-[#5AA9E6] text-black font-bold border-[#5AA9E6]"
                              : "bg-white/5 border-white/10 text-[#EAF4F4]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Ancho Imprimible (Evita corte a la derecha):</span>
                    <div className="flex gap-1">
                      {["55mm", "58mm", "60mm", "63mm"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleUpdateWidth(w)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            customWidth === w
                              ? "bg-[#5AA9E6] text-black font-bold border-[#5AA9E6]"
                              : "bg-white/5 border-white/10 text-[#EAF4F4]"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-[#34D399] italic">
                    ✓ Configuración activa para Epson TM-U220: Margen Izq 3.5mm + Ancho 58mm (Ideal para rollo de 7.5 cm).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Papel Simulado en Pantalla */}
          <div
            className={`bg-white text-black p-3 rounded-lg shadow-2xl font-mono text-[10px] leading-tight mx-auto ${currentConfig.previewWidthClass} border border-gray-300 select-text transition-all`}
            style={{ boxSizing: "border-box" }}
          >
            {renderTicketBody()}
          </div>
        </div>
      </div>
    </>
  );
}
