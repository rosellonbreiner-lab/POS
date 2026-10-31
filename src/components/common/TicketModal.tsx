"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Printer, X, CheckCircle2 } from "lucide-react";

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

export function TicketModal({ isOpen, onClose, data }: TicketModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const isQuote = data.type === "COTIZACION";
  const isAbono = data.type === "ABONO_CREDITO";
  const isCreditSale = data.paymentType === "CREDITO";

  let title = `FACTURA DE VENTA POS #${data.consecutive}`;
  if (isQuote) title = `COTIZACIÓN DE REPUESTOS #${data.consecutive}`;
  if (isAbono) title = `COMPROBANTE DE ABONO #${data.consecutive}`;

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex justify-center items-center">
      {/* Estilos para impresión térmica (58mm / 80mm) */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-ticket-content, #thermal-ticket-content * {
            visibility: visible;
          }
          #thermal-ticket-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            padding: 2mm !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            font-family: 'Courier New', Courier, monospace !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-md my-auto relative space-y-4">
        {/* Barra de Controles Superior */}
        <div className="flex justify-between items-center bg-[#13161F] p-3 rounded-xl border border-white/[0.12] no-print">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <Printer className="w-4 h-4 text-[#5AA9E6]" />
            <span>Vista Previa de Impresora Térmica</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={handlePrint} className="font-bold">
              <Printer className="w-4 h-4 mr-1" />
              Imprimir Ticket
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="p-1.5">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Papel del Ticket Térmico */}
        <div
          id="thermal-ticket-content"
          ref={printAreaRef}
          className="bg-white text-black p-5 rounded-lg shadow-2xl font-mono text-xs leading-tight mx-auto max-w-[340px] border border-gray-300 select-text"
        >
          {/* Logo del Taller si existe */}
          {data.workshopConfig.logoUrl ? (
            <div className="text-center mb-2">
              <img
                src={data.workshopConfig.logoUrl}
                alt="Logo Taller"
                className="max-h-16 mx-auto object-contain"
              />
            </div>
          ) : null}

          {/* Encabezado Taller */}
          <div className="text-center space-y-0.5">
            <div className="text-base font-extrabold tracking-wide uppercase">
              {data.workshopConfig.name || "MOTOTALLER"}
            </div>
            {data.workshopConfig.slogan && (
              <div className="text-[10px] text-gray-700 italic">
                {data.workshopConfig.slogan}
              </div>
            )}
            {data.workshopConfig.nit && (
              <div className="text-[11px] font-semibold">
                NIT: {data.workshopConfig.nit}
              </div>
            )}
            {data.workshopConfig.address && (
              <div className="text-[10px] text-gray-800">
                {data.workshopConfig.address}
              </div>
            )}
            {data.workshopConfig.phone && (
              <div className="text-[10px] text-gray-800">
                TEL: {data.workshopConfig.phone}
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          {/* Datos del Documento */}
          <div className="text-center font-bold text-[12px] uppercase">
            {title}
          </div>
          <div className="text-[10px] text-gray-700 text-center">
            Fecha: {data.date}
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          {/* Datos del Cliente y Vehículo */}
          <div className="space-y-0.5 text-[11px]">
            <div>
              <span className="font-bold">CLIENTE:</span> {data.customerName || "Consumidor Final"}
            </div>
            {data.customerPhone && (
              <div>
                <span className="font-bold">TEL:</span> {data.customerPhone}
              </div>
            )}
            {data.plate && (
              <div>
                <span className="font-bold">MOTO/PLACA:</span> {data.plate}{" "}
                {data.motoModel ? `(${data.motoModel})` : ""}
              </div>
            )}
            {data.paymentType && (
              <div>
                <span className="font-bold">MEDIO DE PAGO:</span> {data.paymentType}
                {isCreditSale && <b className="ml-1 text-red-600">(CRÉDITO / FIADO)</b>}
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          {/* CASO 1: TICKET DE ABONO A CRÉDITO */}
          {isAbono && data.creditInfo ? (
            <div className="space-y-2 py-1 text-[11px]">
              <div className="font-bold text-center text-[12px] bg-gray-100 py-1">
                DETALLE DEL ABONO
              </div>
              <div className="flex justify-between">
                <span>Crédito Ref:</span>
                <span className="font-bold">#CRE-{data.creditInfo.creditConsecutive}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Inicial Deuda:</span>
                <span>${data.creditInfo.totalDebt.toLocaleString("es-CO")} COP</span>
              </div>
              <div className="flex justify-between">
                <span>Saldo Anterior:</span>
                <span className="font-semibold">${data.creditInfo.previousBalance.toLocaleString("es-CO")} COP</span>
              </div>
              <div className="flex justify-between font-bold text-[12px] border-t border-b border-dashed border-black py-1">
                <span>VALOR ABONADO:</span>
                <span>${data.creditInfo.amountPaid.toLocaleString("es-CO")} COP</span>
              </div>
              <div className="flex justify-between font-extrabold text-[13px] pt-1">
                <span>NUEVO SALDO:</span>
                <span>
                  {data.creditInfo.newBalance === 0
                    ? "*** PAZ Y SALVO ***"
                    : `$${data.creditInfo.newBalance.toLocaleString("es-CO")} COP`}
                </span>
              </div>
              {data.creditInfo.receivedBy && (
                <div className="text-[10px] text-gray-700 text-right mt-1">
                  Atendido por: {data.creditInfo.receivedBy}
                </div>
              )}
            </div>
          ) : (
            /* CASO 2: VENTA / COTIZACIÓN CON REPUESTOS */
            <>
              {/* Tabla de Repuestos */}
              <div className="text-[11px]">
                <div className="flex justify-between font-bold border-b border-black pb-1 mb-1">
                  <span className="w-1/2">REPUESTO</span>
                  <span className="w-1/6 text-center">CANT</span>
                  <span className="w-1/3 text-right">TOTAL</span>
                </div>

                <div className="space-y-1">
                  {(data.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="w-1/2 pr-1">
                        <div className="font-semibold leading-tight">{item.name}</div>
                        <div className="text-[9px] text-gray-600">
                          ${item.unitPrice.toLocaleString("es-CO")} c/u
                        </div>
                      </div>
                      <div className="w-1/6 text-center">{item.quantity}</div>
                      <div className="w-1/3 text-right font-semibold">
                        ${item.total.toLocaleString("es-CO")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b border-dashed border-black my-2"></div>

              {/* Total General */}
              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between font-extrabold text-sm border-t border-black pt-1">
                  <span>TOTAL A PAGAR:</span>
                  <span>${data.total.toLocaleString("es-CO")} COP</span>
                </div>
              </div>
            </>
          )}

          <div className="border-b border-dashed border-black my-3"></div>

          {/* Firmas si es crédito o abono */}
          {(isAbono || isCreditSale) && (
            <div className="pt-4 pb-2 space-y-6 text-[10px] text-center">
              <div>
                <div className="border-t border-black w-44 mx-auto pt-1 font-semibold">
                  Firma del Cliente
                </div>
                <div className="text-gray-600 text-[9px]">Acepto y reconozco la deuda</div>
              </div>
            </div>
          )}

          {/* Pie de Página */}
          <div className="text-center text-[10px] space-y-1 text-gray-700">
            <div>
              {data.workshopConfig.receiptMessage ||
                "¡Gracias por confiar en nosotros! Expertos en motos."}
            </div>
            {isQuote && (
              <div className="font-bold text-[9px] text-gray-600">
                * Cotización informativa sujeta a disponibilidad de repuestos.
              </div>
            )}
            <div className="text-[9px] font-sans text-gray-500 pt-1">
              Impreso por MotoTaller Software
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
