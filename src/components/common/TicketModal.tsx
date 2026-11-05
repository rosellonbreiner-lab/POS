"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Printer, X, SlidersHorizontal, CheckCircle2 } from "lucide-react";

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
    label: "Epson TM-U220 (Rollo 7.5 cm)",
    sublabel: "Matricial de impacto · Ancho 66mm · Margen izq 5mm · Letra 11.5px",
    printWidth: "66mm",
    marginLeft: "5mm",
    previewWidthClass: "max-w-[285px]",
    fontSize: "11.5px",
  },
  "80MM": {
    label: "Térmica 80mm",
    sublabel: "Rollo ancho estándar · Ancho útil 72mm · Letra 11px",
    printWidth: "72mm",
    marginLeft: "2mm",
    previewWidthClass: "max-w-[310px]",
    fontSize: "11px",
  },
  "58MM": {
    label: "Térmica 58mm",
    sublabel: "Rollo portátil compacto · Ancho útil 48mm · Letra 9.5px",
    printWidth: "48mm",
    marginLeft: "1mm",
    previewWidthClass: "max-w-[230px]",
    fontSize: "9.5px",
  },
};

const CALIBRATION_VERSION = "v3_75mm_tmu220";

export function TicketModal({ isOpen, onClose, data }: TicketModalProps) {
  const [paperFormat, setPaperFormat] = useState<PaperFormat>("TM_U220");
  const [customWidth, setCustomWidth] = useState<string>("66mm");
  const [customMarginLeft, setCustomMarginLeft] = useState<string>("5mm");
  const [customFontSize, setCustomFontSize] = useState<string>("11.5px");
  const [showAdvancedTuning, setShowAdvancedTuning] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedVersion = localStorage.getItem("pos_ticket_version");
      if (savedVersion !== CALIBRATION_VERSION) {
        // Auto-migración a la versión calibrada para Rollo de 7.5cm / Epson TM-U220
        localStorage.setItem("pos_ticket_version", CALIBRATION_VERSION);
        localStorage.setItem("pos_ticket_paper_format", "TM_U220");
        localStorage.setItem("pos_ticket_custom_width", "66mm");
        localStorage.setItem("pos_ticket_custom_margin", "5mm");
        localStorage.setItem("pos_ticket_custom_font_size", "11.5px");
        setPaperFormat("TM_U220");
        setCustomWidth("66mm");
        setCustomMarginLeft("5mm");
        setCustomFontSize("11.5px");
      } else {
        const savedFormat = localStorage.getItem("pos_ticket_paper_format") as PaperFormat;
        if (savedFormat && FORMAT_CONFIGS[savedFormat]) {
          setPaperFormat(savedFormat);
        }
        const savedWidth = localStorage.getItem("pos_ticket_custom_width");
        if (savedWidth) setCustomWidth(savedWidth);
        const savedMargin = localStorage.getItem("pos_ticket_custom_margin");
        if (savedMargin) setCustomMarginLeft(savedMargin);
        const savedFontSize = localStorage.getItem("pos_ticket_custom_font_size");
        if (savedFontSize) setCustomFontSize(savedFontSize);
      }
    }
  }, []);

  const handleSelectFormat = (fmt: PaperFormat) => {
    setPaperFormat(fmt);
    const cfg = FORMAT_CONFIGS[fmt];
    setCustomWidth(cfg.printWidth);
    setCustomMarginLeft(cfg.marginLeft);
    setCustomFontSize(cfg.fontSize);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_ticket_paper_format", fmt);
      localStorage.setItem("pos_ticket_custom_width", cfg.printWidth);
      localStorage.setItem("pos_ticket_custom_margin", cfg.marginLeft);
      localStorage.setItem("pos_ticket_custom_font_size", cfg.fontSize);
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

  const handleUpdateFontSize = (fs: string) => {
    setCustomFontSize(fs);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_ticket_custom_font_size", fs);
    }
  };

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    // Quitar temporalmente document.title para evitar que navegadores impriman título de pestaña
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
   * Renderizador del cuerpo del ticket
   * Calibrado para alta legibilidad en impresoras matriciales (Epson TM-U220)
   * Usa texto 100% negro puro, negrita firme y unidades relativas para escalar.
   */
  const renderTicketBody = () => (
    <div className="w-full text-black font-mono leading-tight select-text text-left">
      {/* Logo si existe (compacto, alto contraste para cinta de tinta) */}
      {data.workshopConfig.logoUrl ? (
        <div className="text-center mb-1.5">
          <img
            src={data.workshopConfig.logoUrl}
            alt="Logo Negocio"
            className="max-h-12 max-w-full mx-auto object-contain filter grayscale contrast-200"
          />
        </div>
      ) : null}

      {/* Encabezado del Negocio */}
      <div className="text-center space-y-0.5 text-black">
        <div className="text-[1.2em] font-black tracking-wide uppercase leading-tight">
          {data.workshopConfig.name || "SISTEMA POS"}
        </div>

        {data.workshopConfig.slogan && (
          <div className="text-[0.9em] font-bold italic truncate">
            {data.workshopConfig.slogan}
          </div>
        )}

        {(data.workshopConfig.nit || data.workshopConfig.phone) && (
          <div className="text-[0.95em] font-bold">
            {data.workshopConfig.nit ? `NIT: ${data.workshopConfig.nit}` : ""}
            {data.workshopConfig.nit && data.workshopConfig.phone ? " · " : ""}
            {data.workshopConfig.phone ? `TEL: ${data.workshopConfig.phone}` : ""}
          </div>
        )}

        {data.workshopConfig.address && (
          <div className="text-[0.9em] font-bold truncate">
            {data.workshopConfig.address}
          </div>
        )}
      </div>

      {/* Línea divisoria sólida para agujas de impacto */}
      <div className="border-b-2 border-black my-1.5"></div>

      {/* Datos del Documento y Fecha */}
      <div className="flex justify-between items-center text-[1em] text-black">
        <span className="font-black uppercase">{title}</span>
        <span className="text-[0.9em] font-bold font-mono">{data.date}</span>
      </div>

      <div className="border-b-2 border-black my-1.5"></div>

      {/* Datos del Cliente y Vehículo */}
      <div className="space-y-0.5 text-[0.95em] text-black">
        <div className="truncate">
          <span className="font-black">CLIENTE:</span> {data.customerName || "Consumidor Final"}
        </div>
        {data.customerPhone && (
          <div>
            <span className="font-black">TEL:</span> {data.customerPhone}
          </div>
        )}
        {data.plate && (
          <div className="truncate">
            <span className="font-black">MOTO/PLACA:</span> {data.plate}{" "}
            {data.motoModel ? `(${data.motoModel})` : ""}
          </div>
        )}
        {data.paymentType && (
          <div>
            <span className="font-black">PAGO:</span> {data.paymentType}
            {isCreditSale && <b className="ml-1 text-black underline">(CRÉDITO)</b>}
          </div>
        )}
      </div>

      <div className="border-b-2 border-black my-1.5"></div>

      {/* CASO 1: TICKET DE ABONO A CRÉDITO */}
      {isAbono && data.creditInfo ? (
        <div className="space-y-1 py-0.5 text-[0.95em] text-black">
          <div className="font-black text-center text-[1em] border-b-2 border-black pb-0.5">
            DETALLE DEL ABONO
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Crédito Ref:</span>
            <span className="font-black">#CRE-{data.creditInfo.creditConsecutive}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Total Inicial:</span>
            <span className="font-bold">${data.creditInfo.totalDebt.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Saldo Anterior:</span>
            <span className="font-bold">${data.creditInfo.previousBalance.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between font-black text-[1.05em] border-t-2 border-b-2 border-black py-1 my-1">
            <span>VALOR ABONADO:</span>
            <span>${data.creditInfo.amountPaid.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between font-black text-[1.1em] pt-0.5">
            <span>NUEVO SALDO:</span>
            <span>
              {data.creditInfo.newBalance === 0
                ? "*** PAZ Y SALVO ***"
                : `$${data.creditInfo.newBalance.toLocaleString("es-CO")}`}
            </span>
          </div>
          {data.creditInfo.receivedBy && (
            <div className="text-[0.85em] font-bold text-right pt-0.5">
              Atendido por: {data.creditInfo.receivedBy}
            </div>
          )}
        </div>
      ) : (
        /* CASO 2: VENTA / COTIZACIÓN CON ARTÍCULOS */
        <>
          {/* Tabla de Artículos: 50% descripción, 16% cant, 34% total (calibrada para 7.5cm) */}
          <div className="w-full text-black">
            <div className="flex justify-between font-black border-b-2 border-black pb-1 mb-1 text-[0.95em]">
              <span className="w-[50%] text-left">DESCRIPCIÓN</span>
              <span className="w-[16%] text-center">CANT</span>
              <span className="w-[34%] text-right">TOTAL</span>
            </div>

            <div className="space-y-1">
              {(data.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start leading-tight text-black">
                  <div className="w-[50%] pr-1">
                    <div className="font-bold break-words leading-tight">{item.name}</div>
                    <div className="text-[0.85em] font-bold font-mono text-black">
                      ${item.unitPrice.toLocaleString("es-CO")} c/u
                    </div>
                  </div>
                  <div className="w-[16%] text-center font-bold font-mono">{item.quantity}</div>
                  <div className="w-[34%] text-right font-black font-mono">
                    ${item.total.toLocaleString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b-2 border-black my-1.5"></div>

          {/* Total General */}
          <div className="flex justify-between font-black text-[1.15em] border-t-2 border-b-2 border-black py-1 my-1 text-black">
            <span>TOTAL A PAGAR:</span>
            <span>${data.total.toLocaleString("es-CO")}</span>
          </div>
        </>
      )}

      <div className="border-b-2 border-black my-1.5"></div>

      {/* Firmas si es crédito o abono */}
      {(isAbono || isCreditSale) && (
        <div className="pt-2 pb-1 space-y-3 text-[0.85em] text-center text-black">
          <div>
            <div className="border-t-2 border-black w-36 mx-auto pt-1 font-black">
              Firma del Cliente
            </div>
            <div className="text-[0.8em] font-bold">Acepto y reconozco la deuda</div>
          </div>
        </div>
      )}

      {/* Pie de Página */}
      <div className="text-center text-[0.9em] font-bold space-y-0.5 pt-1 text-black">
        <div>
          {data.workshopConfig.receiptMessage || "¡Gracias por su compra! Vuelva pronto."}
        </div>
        {isQuote && (
          <div className="italic text-[0.8em]">
            * Cotización informativa sujeta a disponibilidad de stock.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 
        CALIBRACIÓN EXACTA EPSON TM-U220 CON ROLLO DE 7.5 CM (75mm):
        - Margen Izquierdo: 5mm (evita el punto ciego mecánico del cabezal tractor)
        - Ancho: 66mm (cubre el rollo de 75mm sin dejar la franja blanca a la derecha)
        - Font Size: 11.5px / 12.5px en negrita pura (legible en agujas de impacto y cinta entintada)
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
            padding: 0 1.5mm !important;
            width: ${customWidth} !important;
            max-width: ${customWidth} !important;
            height: auto !important;
            min-height: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: ${customFontSize} !important;
            font-weight: 700 !important;
            font-family: 'Courier New', Courier, 'Lucida Console', monospace !important;
            line-height: 1.25 !important;
            overflow: visible !important;
          }

          #pos-print-portal * {
            box-sizing: border-box !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
        <div className="w-full max-w-lg my-auto relative space-y-3">
          {/* Barra de Controles Superior */}
          <div className="bg-[#13161F] p-3.5 rounded-2xl border border-white/[0.12] space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-white text-sm font-bold">
                <Printer className="w-4 h-4 text-[#5AA9E6]" />
                <span>Impresión de Ticket POS</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={handlePrint} className="font-bold text-xs h-8 px-3">
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Imprimir Ticket
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose} className="p-1 h-8 w-8 text-[#94A3B8] hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Selector de Rollo / Impresora */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Perfil de Impresora:</span>
                <button
                  type="button"
                  onClick={() => setShowAdvancedTuning(!showAdvancedTuning)}
                  className="text-[#5AA9E6] hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {showAdvancedTuning ? "Ocultar Calibración" : "Ajustes de Impresión"}
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
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all border text-left cursor-pointer ${
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

              {/* Panel de Ajuste Fino en Vivo */}
              {showAdvancedTuning && (
                <div className="p-3 rounded-xl bg-black/50 border border-[#5AA9E6]/30 text-[11px] space-y-2.5 mt-2 animate-in fade-in duration-150">
                  {/* Calibración de Tamaño de Letra */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] font-medium">Tamaño de Letra:</span>
                    <div className="flex gap-1.5">
                      {[
                        { label: "10.5px", val: "10.5px" },
                        { label: "11.5px (Recomendado)", val: "11.5px" },
                        { label: "12.5px (Grande)", val: "12.5px" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleUpdateFontSize(item.val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            customFontSize === item.val
                              ? "bg-[#5AA9E6] text-black font-bold border-[#5AA9E6] shadow-sm"
                              : "bg-white/5 border-white/10 text-[#EAF4F4] hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calibración de Ancho de Impresión (Quita el espacio blanco de la derecha) */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] font-medium">Ancho (Rollo 7.5cm):</span>
                    <div className="flex gap-1.5">
                      {[
                        { label: "64mm", val: "64mm" },
                        { label: "66mm (Recomendado)", val: "66mm" },
                        { label: "68mm", val: "68mm" },
                        { label: "70mm", val: "70mm" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleUpdateWidth(item.val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            customWidth === item.val
                              ? "bg-[#5AA9E6] text-black font-bold border-[#5AA9E6] shadow-sm"
                              : "bg-white/5 border-white/10 text-[#EAF4F4] hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calibración de Margen Izquierdo (Mueve hacia la derecha para no cortar a la izquierda) */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] font-medium">Margen Izquierdo:</span>
                    <div className="flex gap-1.5">
                      {[
                        { label: "3.5mm", val: "3.5mm" },
                        { label: "5mm (Recomendado)", val: "5mm" },
                        { label: "6.5mm", val: "6.5mm" },
                        { label: "8mm", val: "8mm" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleUpdateMargin(item.val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            customMarginLeft === item.val
                              ? "bg-[#5AA9E6] text-black font-bold border-[#5AA9E6] shadow-sm"
                              : "bg-white/5 border-white/10 text-[#EAF4F4] hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-[10px] text-[#34D399] bg-[#34D399]/10 p-2 rounded-lg border border-[#34D399]/20">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      <b>Calibrado para Epson TM-U220 (Rollo 7.5 cm):</b> Ancho 66mm llena el papel sin franja derecha, Margen 5mm evita corte a la izquierda, y Letra 11.5px/12.5px en negrita pura garantiza máxima nitidez en cinta de impacto.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Papel Simulado en Pantalla (refleja en vivo ancho y tamaño de letra) */}
          <div
            className="bg-white text-black p-3.5 rounded-lg shadow-2xl font-mono leading-tight mx-auto border border-gray-400 select-text transition-all"
            style={{
              boxSizing: "border-box",
              width: customWidth,
              maxWidth: "100%",
              fontSize: customFontSize,
            }}
          >
            {renderTicketBody()}
          </div>
        </div>
      </div>
    </>
  );
}
