"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  DollarSign,
  Calendar,
  Receipt,
  CreditCard,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  Printer,
  Search,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface CashAccountingViewProps {
  invoices: any[];
  credits: any[];
  dashboardData: any;
  onPrintTicket?: (ticket: any) => void;
}

export function CashAccountingView({
  invoices,
  credits,
  dashboardData,
  onPrintTicket,
}: CashAccountingViewProps) {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateFilterMode, setDateFilterMode] = useState<
    "HOY" | "AYER" | "CALENDARIO" | "TODOS"
  >("HOY");
  const [activeTab, setActiveTab] = useState<"TODOS" | "FACTURAS" | "ABONOS">(
    "TODOS"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  // Extraer todos los abonos a créditos con información del cliente
  const allCreditPayments = useMemo(() => {
    return credits.flatMap((c) =>
      (c.payments || []).map((p: any) => ({
        ...p,
        creditId: c.id,
        creditConsecutive: c.consecutive,
        customerName: c.customer?.name || "Cliente",
        customerPhone: c.customer?.phone,
      }))
    );
  }, [credits]);

  // Determinar la fecha objetivo según el modo
  const targetDateStr = useMemo(() => {
    if (dateFilterMode === "HOY") return todayStr;
    if (dateFilterMode === "AYER") return yesterdayStr;
    if (dateFilterMode === "CALENDARIO") return selectedDate;
    return null; // TODOS
  }, [dateFilterMode, todayStr, yesterdayStr, selectedDate]);

  // Filtrar facturas según la fecha seleccionada
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDateStr = new Date(inv.createdAt).toISOString().slice(0, 10);
      if (targetDateStr && invDateStr !== targetDateStr) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const clientName = (inv.customer?.name || "").toLowerCase();
        const num = String(inv.consecutive || "").toLowerCase();
        return clientName.includes(term) || num.includes(term);
      }
      return true;
    });
  }, [invoices, targetDateStr, searchTerm]);

  // Filtrar abonos según la fecha seleccionada
  const filteredPayments = useMemo(() => {
    return allCreditPayments.filter((p) => {
      const pDateStr = new Date(p.createdAt).toISOString().slice(0, 10);
      if (targetDateStr && pDateStr !== targetDateStr) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const clientName = (p.customerName || "").toLowerCase();
        const notes = (p.notes || "").toLowerCase();
        return clientName.includes(term) || notes.includes(term);
      }
      return true;
    });
  }, [allCreditPayments, targetDateStr, searchTerm]);

  // Métricas financieras calculadas para el día / período seleccionado
  const financialMetrics = useMemo(() => {
    // 1. Facturas directas (Efectivo o Transferencia entran a caja)
    const paidInvoices = filteredInvoices.filter(
      (i) => i.paymentType !== "CREDITO"
    );
    const invoiceSalesTotal = paidInvoices.reduce((s, i) => s + i.total, 0);

    // 2. Facturas a crédito (fiados) otorgados en el período
    const creditInvoices = filteredInvoices.filter(
      (i) => i.paymentType === "CREDITO"
    );
    const creditSalesTotal = creditInvoices.reduce((s, i) => s + i.total, 0);

    // 3. Abonos cobrados de cartera en el período (Entrada real a caja)
    const creditPaymentsTotal = filteredPayments.reduce(
      (s, p) => s + p.amount,
      0
    );

    // 4. Total entradas de dinero físico/digital a caja
    const totalCashIn = invoiceSalesTotal + creditPaymentsTotal;

    // 5. Costo de repuestos despachados en las facturas de este período
    let totalCostOfGoods = 0;
    for (const inv of filteredInvoices) {
      for (const item of inv.items || []) {
        totalCostOfGoods += (item.product?.costPrice || 0) * item.quantity;
      }
    }

    // 6. Utilidad neta real (Total ventas - Costo de repuestos)
    const totalCommercialSales = invoiceSalesTotal + creditSalesTotal;
    const netProfit = totalCommercialSales - totalCostOfGoods;

    // 7. Desglose por medio de pago
    const cashFromSales = filteredInvoices
      .filter((i) => i.paymentType === "EFECTIVO")
      .reduce((s, i) => s + i.total, 0);
    const cashFromPayments = filteredPayments
      .filter((p) => p.paymentType === "EFECTIVO")
      .reduce((s, p) => s + p.amount, 0);
    const totalEfectivo = cashFromSales + cashFromPayments;

    const transferFromSales = filteredInvoices
      .filter((i) => i.paymentType === "TRANSFERENCIA")
      .reduce((s, i) => s + i.total, 0);
    const transferFromPayments = filteredPayments
      .filter((p) => p.paymentType === "TRANSFERENCIA")
      .reduce((s, p) => s + p.amount, 0);
    const totalTransferencia = transferFromSales + transferFromPayments;

    return {
      totalCashIn,
      creditPaymentsTotal,
      invoiceSalesTotal,
      creditSalesTotal,
      totalCommercialSales,
      totalCostOfGoods,
      netProfit,
      totalEfectivo,
      totalTransferencia,
      invoiceCount: filteredInvoices.length,
      paymentCount: filteredPayments.length,
    };
  }, [filteredInvoices, filteredPayments]);

  const handlePrintDailyReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Barra de Control de Fecha / Calendario */}
      <Card className="bg-[#1F3A5F]/20 border-[#5AA9E6]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Opciones rápidas de fecha */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#94A3B8] font-semibold flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#5AA9E6]" />
              Control por Fecha:
            </span>

            <button
              type="button"
              onClick={() => {
                setDateFilterMode("HOY");
                setSelectedDate(todayStr);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                dateFilterMode === "HOY"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              Caja de Hoy
            </button>

            <button
              type="button"
              onClick={() => {
                setDateFilterMode("AYER");
                setSelectedDate(yesterdayStr);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                dateFilterMode === "AYER"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              Caja de Ayer
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
              <span>Elegir Día en Calendario</span>
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode("TODOS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                dateFilterMode === "TODOS"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              Todo el Historial
            </button>
          </div>

          {/* Selector interactivo de calendario */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#222831] px-3 py-1 rounded-lg border border-[#5AA9E6]/40">
              <span className="text-xs text-[#94A3B8]">Fecha:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setDateFilterMode("CALENDARIO");
                }}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrintDailyReport}
              className="text-xs h-8 cursor-pointer"
              title="Imprimir arqueo y reporte de esta fecha"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
              Imprimir Arqueo
            </Button>
          </div>
        </div>
      </Card>

      {/* Tarjetas Principales del Día Seleccionado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Entradas Totales a Caja */}
        <Card className="bg-gradient-to-br from-[#1F3A5F]/40 to-[#222831] border-[#5AA9E6]/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wider block">
                Total Entradas a Caja
              </span>
              <div className="text-2xl font-bold text-white mt-1 tabular-nums">
                ${financialMetrics.totalCashIn.toLocaleString("es-CO")} COP
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#5AA9E6]/20 text-[#5AA9E6]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] text-[#5AA9E6] flex justify-between">
            <span>Ventas + Abonos Cartera</span>
            <span className="font-semibold font-mono">
              {targetDateStr || "Historial"}
            </span>
          </div>
        </Card>

        {/* Abonos Cartera / Cobro de Deudas */}
        <Card className="border-[#5AA9E6]/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-[#5AA9E6] font-medium uppercase tracking-wider block">
                Abonos Cartera / Fiados
              </span>
              <div className="text-2xl font-bold text-[#5AA9E6] mt-1 tabular-nums">
                ${financialMetrics.creditPaymentsTotal.toLocaleString("es-CO")} COP
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#5AA9E6]/10 text-[#5AA9E6]">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] text-[#94A3B8] flex justify-between">
            <span>Dinero cobrado de créditos</span>
            <span className="font-semibold text-white">
              {financialMetrics.paymentCount} abonos
            </span>
          </div>
        </Card>

        {/* Costo de Repuestos */}
        <Card className="border-white/[0.08]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wider block">
                Costo de Repuestos
              </span>
              <div className="text-2xl font-bold text-[#94A3B8] mt-1 tabular-nums">
                ${financialMetrics.totalCostOfGoods.toLocaleString("es-CO")} COP
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.05] text-[#94A3B8]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] text-[#94A3B8] flex justify-between">
            <span>Costo base de compra</span>
            <span className="font-semibold text-white">
              {financialMetrics.invoiceCount} ventas
            </span>
          </div>
        </Card>

        {/* Utilidad Neta Real */}
        <Card className="bg-[#34D399]/5 border-[#34D399]/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-[#34D399] font-medium uppercase tracking-wider block">
                Utilidad Neta Real
              </span>
              <div className="text-2xl font-bold text-[#34D399] mt-1 tabular-nums">
                ${financialMetrics.netProfit.toLocaleString("es-CO")} COP
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#34D399]/20 text-[#34D399]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] text-[#34D399] flex justify-between">
            <span>Ganancia libre del negocio</span>
            <span className="font-semibold">
              {financialMetrics.totalCommercialSales > 0
                ? `${Math.round(
                    (financialMetrics.netProfit /
                      financialMetrics.totalCommercialSales) *
                      100
                  )}% margen`
                : "0%"}
            </span>
          </div>
        </Card>
      </div>

      {/* Desglose por Medio de Pago en el Día */}
      <Card className="p-3.5">
        <div className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#5AA9E6]" />
            Arqueo de Entradas por Medio de Pago:
          </span>
          <span className="text-[11px] text-[#94A3B8] font-mono">
            {targetDateStr ? `Día: ${targetDateStr}` : "Todo el Historial"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[#94A3B8] text-[11px] block">
                💵 Efectivo en Caja:
              </span>
              <span className="font-bold text-white text-base tabular-nums">
                ${financialMetrics.totalEfectivo.toLocaleString("es-CO")} COP
              </span>
            </div>
            <Badge variant="success" className="text-[10px]">
              Efectivo
            </Badge>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[#94A3B8] text-[11px] block">
                📱 Transferencias (Bancos):
              </span>
              <span className="font-bold text-[#5AA9E6] text-base tabular-nums">
                ${financialMetrics.totalTransferencia.toLocaleString("es-CO")} COP
              </span>
            </div>
            <Badge variant="info" className="text-[10px]">
              Transferencia
            </Badge>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[#94A3B8] text-[11px] block">
                🤝 Ventas Fiadas (Crédito):
              </span>
              <span className="font-bold text-amber-300 text-base tabular-nums">
                ${financialMetrics.creditSalesTotal.toLocaleString("es-CO")} COP
              </span>
            </div>
            <Badge variant="warning" className="text-[10px]">
              Por Cobrar
            </Badge>
          </div>
        </div>
      </Card>

      {/* Detalle de Transacciones del Día (Facturas y Abonos) */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#5AA9E6]" />
              Movimientos del Día: {targetDateStr || "Historial Completo"}
            </CardTitle>
            <p className="text-xs text-[#94A3B8]">
              Registros detallados de ventas de mostrador y abonos cobrados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab("TODOS")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                  activeTab === "TODOS"
                    ? "bg-[#5AA9E6] text-black font-semibold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Todos ({filteredInvoices.length + filteredPayments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("FACTURAS")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                  activeTab === "FACTURAS"
                    ? "bg-[#5AA9E6] text-black font-semibold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Ventas ({filteredInvoices.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ABONOS")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                  activeTab === "ABONOS"
                    ? "bg-[#5AA9E6] text-black font-semibold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Abonos ({filteredPayments.length})
              </button>
            </div>

            <div className="w-48">
              <Input
                icon={<Search className="w-3.5 h-3.5" />}
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredInvoices.length === 0 && filteredPayments.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <DollarSign className="w-8 h-8 text-[#94A3B8] mx-auto opacity-40" />
              <p className="text-xs text-[#94A3B8]">
                No se registraron ventas ni abonos en esta fecha.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Sección de Facturas */}
              {(activeTab === "TODOS" || activeTab === "FACTURAS") &&
                filteredInvoices.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#5AA9E6] uppercase tracking-wider flex items-center gap-1.5 px-1 pt-1">
                      <Receipt className="w-3.5 h-3.5" />
                      Ventas de Mostrador ({filteredInvoices.length})
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase text-[#94A3B8] border-b border-white/[0.06]">
                          <tr>
                            <th className="pb-2">Factura #</th>
                            <th className="pb-2">Cliente</th>
                            <th className="pb-2">Repuestos</th>
                            <th className="pb-2">Medio</th>
                            <th className="pb-2">Hora</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {filteredInvoices.map((inv) => (
                            <tr
                              key={inv.id}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-2 font-mono font-bold text-[#5AA9E6]">
                                INV-{inv.consecutive}
                              </td>
                              <td className="py-2 font-medium text-white">
                                {inv.customer?.name || "Consumidor Final"}
                              </td>
                              <td className="py-2 text-[#94A3B8]">
                                {inv.items?.length || 0} repuesto(s)
                              </td>
                              <td className="py-2">
                                <Badge
                                  variant={
                                    inv.paymentType === "CREDITO"
                                      ? "warning"
                                      : inv.paymentType === "TRANSFERENCIA"
                                      ? "info"
                                      : "success"
                                  }
                                  className="text-[9px] py-0.2 px-1.5"
                                >
                                  {inv.paymentType}
                                </Badge>
                              </td>
                              <td className="py-2 text-[#94A3B8] font-mono text-[11px]">
                                {new Date(inv.createdAt).toLocaleTimeString(
                                  "es-CO",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </td>
                              <td className="py-2 text-right font-bold text-white tabular-nums">
                                ${inv.total.toLocaleString("es-CO")} COP
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Sección de Abonos de Cartera */}
              {(activeTab === "TODOS" || activeTab === "ABONOS") &&
                filteredPayments.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-semibold text-[#34D399] uppercase tracking-wider flex items-center gap-1.5 px-1 pt-1">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Abonos Recibidos a Deudas ({filteredPayments.length})
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase text-[#94A3B8] border-b border-white/[0.06]">
                          <tr>
                            <th className="pb-2">Crédito Ref</th>
                            <th className="pb-2">Cliente</th>
                            <th className="pb-2">Medio</th>
                            <th className="pb-2">Recibido Por</th>
                            <th className="pb-2">Hora</th>
                            <th className="pb-2 text-right">Valor Abonado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {filteredPayments.map((p) => (
                            <tr
                              key={p.id}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-2 font-mono font-bold text-amber-300">
                                #CRE-{p.creditConsecutive}
                              </td>
                              <td className="py-2 font-medium text-white">
                                {p.customerName}
                              </td>
                              <td className="py-2">
                                <Badge
                                  variant={
                                    p.paymentType === "TRANSFERENCIA"
                                      ? "info"
                                      : "success"
                                  }
                                  className="text-[9px] py-0.2 px-1.5"
                                >
                                  {p.paymentType}
                                </Badge>
                              </td>
                              <td className="py-2 text-[#94A3B8]">
                                {p.receivedBy || "Cajero"}
                              </td>
                              <td className="py-2 text-[#94A3B8] font-mono text-[11px]">
                                {new Date(p.createdAt).toLocaleTimeString(
                                  "es-CO",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </td>
                              <td className="py-2 text-right font-bold text-[#34D399] tabular-nums">
                                +${p.amount.toLocaleString("es-CO")} COP
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

