"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Clock, User, FileText } from "lucide-react";

export function AuditView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => {
        if (d.logs) setLogs(d.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-[#22D3EE]">
          <ShieldCheck className="w-5 h-5" />
          <CardTitle>Auditoría de Seguridad & Registro de Eventos</CardTitle>
        </div>
        <CardDescription>
          Registro inmutable (append-only) de quién hizo qué, accesos al sistema y modificaciones de inventario/ventas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-xs text-[#9CA3AF]">Cargando registro de seguridad...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9CA3AF]">
            No hay registros de auditoría aún. Cada acción de los usuarios quedará registrada aquí.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-[#9CA3AF] border-b border-white/[0.08]">
                <tr>
                  <th className="pb-2">Fecha y Hora</th>
                  <th className="pb-2">Usuario</th>
                  <th className="pb-2">Acción</th>
                  <th className="pb-2">Recurso Afectado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 font-mono text-[#9CA3AF]">
                      {new Date(log.createdAt).toLocaleString("es-CO")}
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-white">{log.user?.name || "Sistema"}</div>
                      <div className="text-[10px] text-[#9CA3AF]">{log.user?.email} ({log.user?.role})</div>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="primary">{log.action}</Badge>
                    </td>
                    <td className="py-2.5 text-[#22D3EE] font-mono">
                      {log.resource} {log.resourceId ? `(${log.resourceId.substring(0, 8)}...)` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

