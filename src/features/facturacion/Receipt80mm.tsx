import React from "react";

export interface InvoicePrintData {
  consecutive: number;
  date: string;
  customerName?: string;
  documentId?: string;
  paymentType: string;
  items: {
    sku: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
}

/**
 * Plantilla de impresión CSS para Ticket POS de 80 mm
 * Fondo blanco, sin vidrio, tipografía monospace/sans optimizada para impresora térmica.
 */
export function Receipt80mm({ data }: { data: InvoicePrintData }) {
  return (
    <div className="receipt-80mm hidden print:block text-black bg-white p-2 font-mono text-xs max-w-[80mm] mx-auto leading-tight">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-80mm, .receipt-80mm * {
            visibility: visible;
          }
          .receipt-80mm {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
        }
      `}</style>

      {/* Cabecera Taller */}
      <div className="text-center pb-2 border-b border-dashed border-gray-400">
        <h2 className="font-bold text-sm tracking-wide">MOTOTALLER</h2>
        <p className="text-[10px]">NIT: 901.452.889-1</p>
        <p className="text-[10px]">Maicao, La Guajira · Colombia</p>
        <p className="text-[10px]">Tel: (+57) 300 000 0000</p>
      </div>

      {/* Datos Factura */}
      <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
        <p><span className="font-bold">Factura POS #:</span> {data.consecutive}</p>
        <p><span className="font-bold">Fecha:</span> {data.date}</p>
        <p><span className="font-bold">Cliente:</span> {data.customerName || "Consumidor Final"}</p>
        {data.documentId && <p><span className="font-bold">C.C./NIT:</span> {data.documentId}</p>}
        <p><span className="font-bold">Pago:</span> {data.paymentType}</p>
      </div>

      {/* Items */}
      <table className="w-full text-[10px] my-2">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th className="py-1">Cant</th>
            <th className="py-1">Detalle</th>
            <th className="py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 align-top">{item.quantity}x</td>
              <td className="py-1">
                <div>{item.description}</div>
                <div className="text-[9px] text-gray-500">${item.unitPrice.toLocaleString("es-CO")} c/u</div>
              </td>
              <td className="py-1 text-right align-top font-bold">
                ${item.totalPrice.toLocaleString("es-CO")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="pt-2 border-t border-dashed border-gray-400 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${data.subtotal.toLocaleString("es-CO")}</span>
        </div>
        {data.discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Descuento:</span>
            <span>-${data.discount.toLocaleString("es-CO")}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>IVA (19%):</span>
          <span>${data.taxAmount.toLocaleString("es-CO")}</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300">
          <span>TOTAL:</span>
          <span>${data.total.toLocaleString("es-CO")} COP</span>
        </div>
      </div>

      {/* Pie Legal */}
      <div className="text-center pt-3 mt-3 border-t border-dashed border-gray-400 text-[9px] text-gray-500 space-y-1">
        <p>Documento de Control Interno / POS</p>
        <p>¡Gracias por confiar en MotoTaller!</p>
      </div>
    </div>
  );
}

