"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  CreditCard,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Plus,
  X,
  User,
  Phone,
  FileText,
  Calendar,
  Trash2,
} from "lucide-react";
import { TicketData } from "@/components/common/TicketModal";

interface CreditsViewProps {
  credits: any[];
  onRefresh: () => void;
  workshopConfig: any;
  onOpenTicket: (ticket: TicketData) => void;
  userRole?: string;
}

export function CreditsView({
  credits,
  onRefresh,
  workshopConfig,
  onOpenTicket,
  userRole,
}: CreditsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | "PENDIENTES" | "PARCIALES" | "PAGADOS">("TODOS");
  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState<any | null>(null);
  const [selectedCreditForHistory, setSelectedCreditForHistory] = useState<any | null>(null);
  const [creditToDelete, setCreditToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const canDelete = userRole === "SUPERADMIN" || userRole === "ADMIN";

  // Estados del modal de abono
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Cálculos estadísticos
  const totalReceivable = credits
    .filter((c) => c.status !== "PAGADO")
    .reduce((sum, c) => sum + (c.remainingAmount || 0), 0);

  const totalPaid = credits.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const pendingCreditsCount = credits.filter((c) => c.status !== "PAGADO").length;
  const paidCreditsCount = credits.filter((c) => c.status === "PAGADO").length;

  // Filtrado
  const filteredCredits = credits.filter((c) => {
    // Filtro por estado
    if (statusFilter === "PENDIENTES" && c.status !== "PENDIENTE") return false;
    if (statusFilter === "PARCIALES" && c.status !== "PARCIAL") return false;
    if (statusFilter === "PAGADOS" && c.status !== "PAGADO") return false;

    // Filtro por término
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const customer = (c.customer?.name || "").toLowerCase();
    const phone = (c.customer?.phone || "").toLowerCase();
    const plate = (c.plate || "").toLowerCase();
    const consecutive = String(c.consecutive);
    const invoiceConsecutive = String(c.invoice?.consecutive || "");

    return (
      customer.includes(term) ||
      phone.includes(term) ||
      plate.includes(term) ||
      consecutive.includes(term) ||
      invoiceConsecutive.includes(term)
    );
  });

  const handleOpenPaymentModal = (credit: any) => {
    setSelectedCreditForPayment(credit);
    setPaymentAmount("");
    setPaymentType("EFECTIVO");
    setPaymentNotes("");
    setPaymentError(null);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreditForPayment) return;

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setPaymentError("Ingresa un monto válido para el abono");
      return;
    }

    if (amount > selectedCreditForPayment.remainingAmount) {
      setPaymentError(
        `El valor ($${amount.toLocaleString("es-CO")}) supera el saldo pendiente de $${selectedCreditForPayment.remainingAmount.toLocaleString("es-CO")}.`
      );
      return;
    }

    setSubmittingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch(`/api/credits/${selectedCreditForPayment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentType,
          notes: paymentNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar abono");

      const receipt = data.receiptInfo;
      setSelectedCreditForPayment(null);
      onRefresh();

      // Abrir comprobante térmico del abono
      if (receipt) {
        onOpenTicket({
          type: "ABONO_CREDITO",
          consecutive: `ABO-${selectedCreditForPayment.consecutive}`,
          date: new Date().toLocaleString("es-CO"),
          customerName: receipt.customerName,
          customerPhone: receipt.customerPhone,
          plate: receipt.plate,
          total: amount,
          paymentType,
          creditInfo: {
            creditConsecutive: receipt.creditConsecutive,
            previousBalance: receipt.previousBalance,
            amountPaid: receipt.amount,
            newBalance: receipt.newBalance,
            totalDebt: selectedCreditForPayment.totalAmount,
            receivedBy: receipt.receivedBy,
          },
          workshopConfig,
        });
      }
    } catch (err: any) {
      setPaymentError(err.message || "Error al procesar el abono");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handlePrintCreditStateTicket = (credit: any) => {
    onOpenTicket({
      type: "ABONO_CREDITO",
      consecutive: `EST-${credit.consecutive}`,
      date: new Date().toLocaleString("es-CO"),
      customerName: credit.customer?.name,
      customerPhone: credit.customer?.phone,
      plate: credit.plate,
      total: credit.totalAmount,
      paymentType: "ESTADO DE CUENTA",
      creditInfo: {
        creditConsecutive: credit.consecutive,
        previousBalance: credit.totalAmount,
        amountPaid: credit.paidAmount,
        newBalance: credit.remainingAmount,
        totalDebt: credit.totalAmount,
        receivedBy: "Caja Taller",
      },
      workshopConfig,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas KPI de Cartera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-300">Total en la Calle (Por Cobrar)</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mt-2">
            ${totalReceivable.toLocaleString("es-CO")} COP
          </div>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">
            {pendingCreditsCount} crédito(s) pendientes por recaudar
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#34D399]">Total Recuperado en Abonos</span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mt-2">
            ${totalPaid.toLocaleString("es-CO")} COP
          </div>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">
            Dinero recaudado de créditos
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">Créditos Activos</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mt-2">
            {pendingCreditsCount}
          </div>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">
            Clientes con saldo pendiente
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#22D3EE]">Créditos Saldados</span>
            <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mt-2">
            {paidCreditsCount}
          </div>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">
            Paz y salvo totalmente cancelados
          </span>
        </div>
      </div>

      {/* Contenedor Principal */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Cuentas por Cobrar & Repuestos a Crédito</CardTitle>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Administra los fiados otorgados a clientes, registra abonos parciales y emite tickets de paz y salvo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onRefresh} className="text-xs">
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: "TODOS", label: "Todos" },
                  { id: "PENDIENTES", label: "Pendientes" },
                  { id: "PARCIALES", label: "Con Abonos" },
                  { id: "PAGADOS", label: "Paz y Salvo" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-[#5AA9E6] text-white"
                      : "bg-white/[0.04] text-[#9CA3AF] hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <Input
                icon={<Search className="w-4 h-4 text-[#9CA3AF]" />}
                placeholder="Buscar cliente, placa o #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Tabla de Créditos */}
          {filteredCredits.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-50" />
              <p className="text-sm text-[#9CA3AF]">
                {searchTerm || statusFilter !== "TODOS"
                  ? "No se encontraron créditos con los filtros aplicados."
                  : "No hay repuestos registrados a crédito."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-[#9CA3AF] border-b border-white/[0.08]">
                  <tr>
                    <th className="pb-3 font-semibold">Crédito #</th>
                    <th className="pb-3 font-semibold">Cliente & Contacto</th>
                    <th className="pb-3 font-semibold">Moto / Placa</th>
                    <th className="pb-3 font-semibold text-right">Total Deuda</th>
                    <th className="pb-3 font-semibold text-right">Abonado</th>
                    <th className="pb-3 font-semibold text-right">Saldo Pendiente</th>
                    <th className="pb-3 font-semibold text-center">Estado</th>
                    <th className="pb-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredCredits.map((credit) => {
                    const isFullyPaid = credit.status === "PAGADO" || credit.remainingAmount === 0;
                    return (
                      <tr key={credit.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5">
                          <span className="font-mono font-bold text-[#5AA9E6]">
                            CRE-{credit.consecutive}
                          </span>
                          {credit.invoice && (
                            <span className="block text-[11px] text-[#9CA3AF] font-mono">
                              Fact: INV-{credit.invoice.consecutive}
                            </span>
                          )}
                          <span className="text-[10px] text-[#9CA3AF] block">
                            {new Date(credit.createdAt).toLocaleDateString("es-CO")}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <div className="font-medium text-white">{credit.customer?.name}</div>
                          {credit.customer?.phone && (
                            <div className="text-[11px] text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[#22D3EE]" />
                              <span>{credit.customer.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5">
                          {credit.plate ? (
                            <span className="font-mono bg-white/[0.08] px-2 py-0.5 rounded text-white font-bold text-xs">
                              {credit.plate}
                            </span>
                          ) : (
                            <span className="text-xs text-[#9CA3AF]">Sin placa</span>
                          )}
                        </td>

                        <td className="py-3.5 text-right font-semibold text-white tabular-nums">
                          ${credit.totalAmount.toLocaleString("es-CO")} COP
                        </td>

                        <td className="py-3.5 text-right font-semibold text-[#34D399] tabular-nums">
                          ${credit.paidAmount.toLocaleString("es-CO")} COP
                        </td>

                        <td className="py-3.5 text-right tabular-nums">
                          <span
                            className={`font-bold text-base ${
                              isFullyPaid
                                ? "text-[#34D399]"
                                : "text-red-400 font-extrabold"
                            }`}
                          >
                            ${credit.remainingAmount.toLocaleString("es-CO")} COP
                          </span>
                        </td>

                        <td className="py-3.5 text-center">
                          {isFullyPaid ? (
                            <Badge variant="success" className="font-bold">
                              ✓ PAZ Y SALVO
                            </Badge>
                          ) : credit.paidAmount > 0 ? (
                            <Badge variant="warning" className="font-bold">
                              EN ABONOS
                            </Badge>
                          ) : (
                            <Badge variant="danger" className="font-bold">
                              PENDIENTE
                            </Badge>
                          )}
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isFullyPaid && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenPaymentModal(credit)}
                                className="h-8 text-xs bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 hover:bg-[#34D399] hover:text-black font-semibold cursor-pointer"
                                title="Registrar un abono de dinero a esta deuda"
                              >
                                <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                                Abonar
                              </Button>
                            )}

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedCreditForHistory(credit)}
                              className="h-8 text-xs cursor-pointer"
                              title="Ver historial de abonos"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1 text-[#22D3EE]" />
                              Historial ({credit.payments?.length || 0})
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handlePrintCreditStateTicket(credit)}
                              className="h-8 text-xs cursor-pointer"
                              title="Imprimir estado de cuenta térmico"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#5AA9E6]" />
                            </Button>

                            {canDelete && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setCreditToDelete(credit)}
                                className="h-8 text-xs px-2 cursor-pointer bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30"
                                title="Eliminar este crédito y todos sus abonos"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Confirmar Eliminación de Deuda / Crédito */}
      {creditToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#222831] border border-[#F87171]/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F87171]/20 border border-[#F87171]/40 text-[#F87171] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                ¿Eliminar Crédito #CRE-{creditToDelete.consecutive}?
              </h3>
              <p className="text-sm text-[#94A3B8] mt-1">
                Cliente: <b className="text-white">{creditToDelete.customer?.name}</b> · Saldo:{" "}
                <b className="text-[#F87171]">${creditToDelete.remainingAmount.toLocaleString("es-CO")} COP</b>
              </p>
              <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EAF4F4] text-left space-y-1">
                <p>• Se eliminarán permanentemente todos los abonos registrados a este crédito.</p>
                <p>• Si estaba vinculado a una factura de venta, la factura también será retirada.</p>
                <p>• Esta acción limpiará la cartera por cobrar del cliente.</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={deleteLoading}
                onClick={() => setCreditToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  try {
                    const res = await fetch(`/api/credits/${creditToDelete.id}`, {
                      method: "DELETE",
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    setCreditToDelete(null);
                    onRefresh();
                  } catch (err: any) {
                    alert(err.message || "Error al eliminar crédito");
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                className="bg-[#F87171] hover:bg-[#EF4444] text-white font-bold"
              >
                {deleteLoading ? "Eliminando..." : "Sí, Eliminar Crédito"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR ABONO */}
      {selectedCreditForPayment && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/80 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="w-full max-w-md bg-[#13161F] border border-white/20 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#34D399]" />
                  Registrar Abono a Crédito
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Crédito #CRE-{selectedCreditForPayment.consecutive} · Cliente:{" "}
                  <b className="text-white">{selectedCreditForPayment.customer?.name}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCreditForPayment(null)}
                className="text-[#9CA3AF] hover:text-white p-1 rounded hover:bg-white/[0.08] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                {paymentError}
              </div>
            )}

            {/* Resumen del Saldo Actual */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Deuda Total Inicial:</span>
                <span>${selectedCreditForPayment.totalAmount.toLocaleString("es-CO")} COP</span>
              </div>
              <div className="flex justify-between text-[#34D399]">
                <span>Total Abonado hasta hoy:</span>
                <span>+${selectedCreditForPayment.paidAmount.toLocaleString("es-CO")} COP</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t border-white/[0.06] pt-1.5">
                <span>Saldo Pendiente:</span>
                <span className="text-red-400">
                  ${selectedCreditForPayment.remainingAmount.toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              {/* Valor del Abono */}
              <div>
                <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                  Valor a Abonar ($ COP) *
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  max={selectedCreditForPayment.remainingAmount}
                  placeholder="Ej. 50000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="text-lg font-bold text-[#34D399] tracking-wider"
                />

                {/* Botones de sugerencia rápida */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(String(selectedCreditForPayment.remainingAmount))}
                    className="px-2.5 py-1 rounded bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-xs font-bold hover:bg-[#34D399] hover:text-black transition-colors cursor-pointer"
                  >
                    Pagar Todo ($
                    {selectedCreditForPayment.remainingAmount.toLocaleString("es-CO")})
                  </button>
                  {[20000, 50000, 100000].map((amt) => {
                    if (amt >= selectedCreditForPayment.remainingAmount) return null;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPaymentAmount(String(amt))}
                        className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-white text-xs hover:bg-white/[0.1] transition-colors cursor-pointer"
                      >
                        +${amt.toLocaleString("es-CO")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Medio de Pago */}
              <div>
                <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                  Medio de Pago Recibido:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "EFECTIVO", label: "Efectivo en Caja" },
                    { id: "TRANSFERENCIA", label: "Transferencia / Nequi" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentType(m.id as any)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer text-center ${
                        paymentType === m.id
                          ? "bg-[#34D399]/20 border-[#34D399] text-[#34D399]"
                          : "bg-white/[0.03] border-white/[0.08] text-[#9CA3AF] hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observación */}
              <div>
                <label className="text-xs text-[#9CA3AF] font-medium block mb-1">
                  Notas / Observación (Opcional):
                </label>
                <Input
                  placeholder="Ej. Abono traído en efectivo por el cliente"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedCreditForPayment(null)}
                  disabled={submittingPayment}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingPayment || !paymentAmount}
                  className="bg-[#34D399] text-black hover:bg-[#34D399]/90 font-bold"
                >
                  {submittingPayment ? "Procesando..." : "Confirmar Abono & Imprimir"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL DE ABONOS */}
      {selectedCreditForHistory && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/80 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="w-full max-w-lg bg-[#13161F] border border-white/20 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#22D3EE]" />
                  Historial de Abonos - Crédito #CRE-{selectedCreditForHistory.consecutive}
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Cliente: <b className="text-white">{selectedCreditForHistory.customer?.name}</b> ·
                  Placa: <b className="text-white font-mono">{selectedCreditForHistory.plate || "S/P"}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCreditForHistory(null)}
                className="text-[#9CA3AF] hover:text-white p-1 rounded hover:bg-white/[0.08] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[#9CA3AF] block text-[10px]">Total Inicial</span>
                <b className="text-white font-mono">
                  ${selectedCreditForHistory.totalAmount.toLocaleString("es-CO")}
                </b>
              </div>
              <div className="p-2.5 rounded-lg bg-[#34D399]/10 border border-[#34D399]/20">
                <span className="text-[#34D399] block text-[10px]">Total Pagado</span>
                <b className="text-[#34D399] font-mono">
                  ${selectedCreditForHistory.paidAmount.toLocaleString("es-CO")}
                </b>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="text-red-300 block text-[10px]">Saldo Restante</span>
                <b className="text-red-400 font-mono">
                  ${selectedCreditForHistory.remainingAmount.toLocaleString("es-CO")}
                </b>
              </div>
            </div>

            {/* Listado de Abonos */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                Pagos Registrados ({selectedCreditForHistory.payments?.length || 0})
              </span>

              {(!selectedCreditForHistory.payments || selectedCreditForHistory.payments.length === 0) ? (
                <div className="p-6 text-center text-xs text-[#9CA3AF] border border-dashed border-white/[0.08] rounded-xl">
                  Aún no se han recibido abonos para este crédito.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCreditForHistory.payments.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#34D399] text-sm">
                            +${p.amount.toLocaleString("es-CO")} COP
                          </span>
                          <Badge variant="info">{p.paymentType}</Badge>
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] mt-1 flex items-center gap-2">
                          <span>Fecha: {new Date(p.createdAt).toLocaleString("es-CO")}</span>
                          {p.receivedBy && <span>· Atendido por: {p.receivedBy}</span>}
                        </div>
                        {p.notes && (
                          <p className="text-[11px] text-gray-300 italic mt-0.5">"{p.notes}"</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-[#9CA3AF] block">Saldo tras este abono:</span>
                        <span className="font-mono font-bold text-white">
                          ${p.newBalance.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón cerrar */}
            <div className="pt-2 flex justify-between items-center border-t border-white/[0.08]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePrintCreditStateTicket(selectedCreditForHistory)}
              >
                <Printer className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                Imprimir Estado de Cuenta
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCreditForHistory(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

