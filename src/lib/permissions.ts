import { UserRole } from "@prisma/client";

export type Permission =
  // Inventario
  | "inventario:leer"
  | "inventario:crear"
  | "inventario:editar"
  | "inventario:ajustar"
  | "inventario:eliminar"
  // Ventas y Facturación
  | "ventas:crear"
  | "ventas:facturar"
  | "ventas:anular"
  | "ventas:descuentos"
  // Cotizaciones
  | "cotizaciones:crear"
  | "cotizaciones:editar"
  | "cotizaciones:aprobar"
  // Órdenes de Trabajo
  | "ordenes:crear"
  | "ordenes:editar"
  | "ordenes:cerrar"
  // Contabilidad y Caja
  | "caja:abrir"
  | "caja:cerrar"
  | "caja:arqueo"
  | "contabilidad:ver"
  | "contabilidad:editar"
  // Administración y Auditoría
  | "admin:usuarios"
  | "admin:configuracion"
  | "auditoria:ver";

export const ROLE_PERMISSIONS: Partial<Record<UserRole, Permission[]>> = {
  SUPERADMIN: [
    "inventario:leer",
    "inventario:crear",
    "inventario:editar",
    "inventario:ajustar",
    "inventario:eliminar",
    "ventas:crear",
    "ventas:facturar",
    "ventas:anular",
    "ventas:descuentos",
    "cotizaciones:crear",
    "cotizaciones:editar",
    "cotizaciones:aprobar",
    "ordenes:crear",
    "ordenes:editar",
    "ordenes:cerrar",
    "caja:abrir",
    "caja:cerrar",
    "caja:arqueo",
    "contabilidad:ver",
    "contabilidad:editar",
    "admin:usuarios",
    "admin:configuracion",
    "auditoria:ver",
  ],
  ADMIN: [
    "inventario:leer",
    "inventario:crear",
    "inventario:editar",
    "inventario:ajustar",
    "inventario:eliminar",
    "ventas:crear",
    "ventas:facturar",
    "ventas:anular",
    "ventas:descuentos",
    "cotizaciones:crear",
    "cotizaciones:editar",
    "cotizaciones:aprobar",
    "ordenes:crear",
    "ordenes:editar",
    "ordenes:cerrar",
    "caja:abrir",
    "caja:cerrar",
    "caja:arqueo",
    "contabilidad:ver",
    "contabilidad:editar",
    "admin:usuarios",
    "admin:configuracion",
    "auditoria:ver",
  ],
  TRABAJADOR: [
    "inventario:leer",
    "ordenes:crear",
    "ordenes:editar",
    "cotizaciones:crear",
    "cotizaciones:editar",
    "ventas:crear",
  ],
  CONTADOR: [
    "inventario:leer",
    "caja:arqueo",
    "contabilidad:ver",
    "contabilidad:editar",
    "auditoria:ver",
  ],
  CAJERO: [
    "inventario:leer",
    "ventas:crear",
    "ventas:facturar",
    "cotizaciones:crear",
    "cotizaciones:editar",
    "caja:abrir",
    "caja:cerrar",
  ],
  BODEGUERO: [
    "inventario:leer",
    "inventario:crear",
    "inventario:editar",
    "inventario:ajustar",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

