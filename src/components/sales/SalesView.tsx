"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ShoppingCart,
  Calendar,
  Search,
  Printer,
  DollarSign,
  Receipt,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface SalesViewProps {
  invoices: any[];
  onNewSale: () => void;
  onPrintInvoice: (inv: any) => void;
  onDeleteInvoice?: (invoiceId: string) => Promise<void>;
  userRole?: string;
}

export function SalesView({
  invoices,
  onNewSale,
  onPrintInvoice,
  onDeleteInvoice,
  userRole,
}: SalesViewProps) {
  const [invoiceToDelete, setInvoiceToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const canDelete = userRole === "SUPERADMIN" || userRole === "ADMIN";
  const [searchTerm, setSearchTerm] = useState("");
  // Filtro de tiempo: "HOY", "AYER", "ULTIMOS_7", "CALENDARIO", "TODAS"
  const [dateFilterMode, setDateFilterMode] = useState<
    "HOY" | "AYER" | "ULTIMOS_7" | "CALENDARIO" | "TODAS"
  >("HOY");

  // Fecha seleccionada en el calendario (formato YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // Calcular fechas de comparación
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  // Filtrar facturas según el modo de calendario seleccionado
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDateStr = new Date(inv.createdAt).toISOString().slice(0, 10);

      // Filtro de fecha
      let matchesDate = true;
      if (dateFilterMode === "HOY") {
        matchesDate = invDateStr === todayStr;
      } else if (dateFilterMode === "AYER") {
        matchesDate = invDateStr === yesterdayStr;
      } else if (dateFilterMode === "ULTIMOS_7") {
        matchesDate = invDateStr >= sevenDaysAgoStr && invDateStr <= todayStr;
      } else if (dateFilterMode === "CALENDARIO") {
        matchesDate = invDateStr === selectedCalendarDate;
      } else if (dateFilterMode === "TODAS") {
        matchesDate = true;
      }

      // Filtro de texto (búsqueda)
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const clientName = (inv.customer?.name || "").toLowerCase();
        const consecutive = String(inv.consecutive || "").toLowerCase();
        const paymentType = (inv.paymentType || "").toLowerCase();
        matchesSearch =
          clientName.includes(term) ||
          consecutive.includes(term) ||
          paymentType.includes(term);
      }

      return matchesDate && matchesSearch;
    });
  }, [
    invoices,
    dateFilterMode,
    selectedCalendarDate,
    searchTerm,
    todayStr,
    yesterdayStr,
    sevenDaysAgoStr,
  ]);

  // Resumen del grupo de facturas filtradas
  const stats = useMemo(() => {
    const count = filteredInvoices.length;
    const totalCobrado = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const efectivo = filteredInvoices
      .filter((i) => i.paymentType === "EFECTIVO")
      .reduce((sum, i) => sum + i.total, 0);
    const transferencia = filteredInvoices
      .filter((i) => i.paymentType === "TRANSFERENCIA")
      .reduce((sum, i) => sum + i.total, 0);
    const credito = filteredInvoices
      .filter((i) => i.paymentType === "CREDITO")
      .reduce((sum, i) => sum + i.total, 0);

    return { count, totalCobrado, efectivo, transferencia, credito };
  }, [filteredInvoices]);

  // Facturas de hoy para el indicador rápido
  const todayInvoicesCount = useMemo(() => {
    return invoices.filter(
      (inv) => new Date(inv.createdAt).toISOString().slice(0, 10) === todayStr
    ).length;
  }, [invoices, todayStr]);

  return (
    <div className="space-y-4">
      {/* Barra de Control de Fecha y Filtros */}
      <Card className="bg-[#1F3A5F]/20 border-[#5AA9E6]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Selector de modo temporal */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#94A3B8] font-semibold flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#5AA9E6]" />
              Ver:
            </span>

            <button
              type="button"
              onClick={() => setDateFilterMode("HOY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                dateFilterMode === "HOY"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <span>Ventas de Hoy</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  dateFilterMode === "HOY"
                    ? "bg-black/20 text-black"
                    : "bg-white/10 text-[#5AA9E6]"
                }`}
              >
                {todayInvoicesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode("AYER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                dateFilterMode === "AYER"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              Ayer
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode("ULTIMOS_7")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                dateFilterMode === "ULTIMOS_7"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              Últimos 7 días
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode("CALENDARIO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                dateFilterMode === "CALENDARIO"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <span>Elegir Día</span>
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode("TODAS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                dateFilterMode === "TODAS"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              Historial Completo
            </button>
          </div>

          {/* Selector de Fecha específico (Calendario) */}
          {dateFilterMode === "CALENDARIO" && (
            <div className="flex items-center gap-2 bg-[#222831] px-3 py-1 rounded-lg border border-[#5AA9E6]/40">
              <span className="text-xs text-[#94A3B8]">Día:</span>
              <input
                type="date"
                value={selectedCalendarDate}
                onChange={(e) => setSelectedCalendarDate(e.target.value)}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {/* Buscador rápido de facturas */}
          <div className="w-full lg:w-64">
            <Input
              icon={<Search className="w-3.5 h-3.5" />}
              placeholder="Buscar por cliente, factura #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Mini-resumen de la fecha seleccionada */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="text-[11px] text-[#94A3B8]">Facturas Registradas</div>
          <div className="text-lg font-bold text-white mt-0.5 tabular-nums">
            {stats.count} facturas
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#5AA9E6]/10 border border-[#5AA9E6]/30">
          <div className="text-[11px] text-[#5AA9E6] font-medium">Total Facturado</div>
          <div className="text-lg font-bold text-white mt-0.5 tabular-nums">
            ${stats.totalCobrado.toLocaleString("es-CO")} COP
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="text-[11px] text-[#34D399]">Efectivo / Transferencia</div>
          <div className="text-lg font-bold text-[#34D399] mt-0.5 tabular-nums">
            ${(stats.efectivo + stats.transferencia).toLocaleString("es-CO")} COP
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="text-[11px] text-amber-300">Ventas a Crédito (Fiado)</div>
          <div className="text-lg font-bold text-amber-300 mt-0.5 tabular-nums">
            ${stats.credito.toLocaleString("es-CO")} COP
          </div>
        </div>
      </div>

      {/* Tabla Principal de Facturas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#5AA9E6]" />
              {dateFilterMode === "HOY" && "Facturas Emitidas Hoy"}
              {dateFilterMode === "AYER" && "Facturas Emitidas Ayer"}
              {dateFilterMode === "ULTIMOS_7" && "Facturas de los Últimos 7 Días"}
              {dateFilterMode === "CALENDARIO" && `Facturas del Día: ${selectedCalendarDate}`}
              {dateFilterMode === "TODAS" && "Todas las Facturas Emitidas"}
            </CardTitle>
            <p className="text-xs text-[#94A3B8]">
              Mostrando {filteredInvoices.length} registro(s) en este período.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onNewSale}
            className="text-xs font-bold"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Nueva Venta
          </Button>
        </CardHeader>

        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <ShoppingCart className="w-8 h-8 text-[#94A3B8] mx-auto opacity-40" />
              <p className="text-xs text-[#94A3B8]">
                No se registraron ventas en la fecha o filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase text-[#94A3B8] border-b border-white/[0.08]">
                  <tr>
                    <th className="pb-2.5 font-semibold">Factura #</th>
                    <th className="pb-2.5 font-semibold">Cliente</th>
                    <th className="pb-2.5 font-semibold">Repuestos</th>
                    <th className="pb-2.5 font-semibold">Medio de Pago</th>
                    <th className="pb-2.5 font-semibold">Fecha y Hora</th>
                    <th className="pb-2.5 font-semibold text-right">Total</th>
                    <th className="pb-2.5 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 font-mono font-bold text-[#5AA9E6]">
                        INV-{inv.consecutive}
                      </td>
                      <td className="py-2.5 font-medium text-white">
                        {inv.customer?.name || "Consumidor Final"}
                      </td>
                      <td className="py-2.5 text-[#94A3B8]">
                        {inv.items?.length || 0} repuesto(s)
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={
                            inv.paymentType === "CREDITO"
                              ? "warning"
                              : inv.paymentType === "TRANSFERENCIA"
                              ? "info"
                              : "success"
                          }
                          className="text-[10px] py-0.5 px-2"
                        >
                          {inv.paymentType === "CREDITO" ? "A CRÉDITO" : inv.paymentType}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-[#94A3B8] font-mono text-[11px]">
                        {new Date(inv.createdAt).toLocaleString("es-CO", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 text-right font-bold text-white tabular-nums">
                        ${inv.total.toLocaleString("es-CO")} COP
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPrintInvoice(inv)}
                            className="h-7 text-[11px] px-2.5 cursor-pointer"
                            title="Reimprimir ticket térmico"
                          >
                            <Printer className="w-3 h-3 mr-1 text-[#5AA9E6]" />
                            Ticket
                          </Button>

                          {canDelete && onDeleteInvoice && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setInvoiceToDelete(inv)}
                              className="h-7 text-[11px] px-2 cursor-pointer bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30"
                              title="Eliminar esta factura por completo y reponer el stock"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Confirmar Eliminación de Factura */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#222831] border border-[#F87171]/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F87171]/20 border border-[#F87171]/40 text-[#F87171] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                ¿Eliminar Venta INV-{invoiceToDelete.consecutive}?
              </h3>
              <p className="text-sm text-[#94A3B8] mt-1">
                Cliente: <b className="text-white">{invoiceToDelete.customer?.name || "Consumidor Final"}</b> · Total:{" "}
                <b className="text-[#34D399]">${invoiceToDelete.total.toLocaleString("es-CO")} COP</b>
              </p>
              <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EAF4F4] text-left space-y-1">
                <p>• Los repuestos vendidos volverán automáticamente al inventario.</p>
                <p>• Si era una venta a crédito, se eliminará el crédito y sus abonos.</p>
                <p>• Esta acción limpiará este comprobante del balance y la caja.</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={deleteLoading}
                onClick={() => setInvoiceToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleteLoading}
                onClick={async () => {
                  if (!onDeleteInvoice) return;
                  setDeleteLoading(true);
                  try {
                    await onDeleteInvoice(invoiceToDelete.id);
                    setInvoiceToDelete(null);
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                className="bg-[#F87171] hover:bg-[#EF4444] text-white font-bold"
              >
                {deleteLoading ? "Eliminando..." : "Sí, Eliminar Venta"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

