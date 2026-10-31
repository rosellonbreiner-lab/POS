# MEMORY — estado actual

_Última actualización: 2026-10-28_

## Estado
- ✅ Documentación base preparada en docs/
- ✅ Fase 0 completada: Next.js 15, Tailwind, diseño Glass Dashboard v5, componentes Emil Kowalski, Docker compose.
- ✅ Fase 1 (Núcleo seguro) implementada: RBAC, auth argon2id + sesiones servidor HttpOnly, middleware cabeceras OWASP, AuditLog inmutable.
- ✅ Fase 2 (Inventario) implementada: Esquemas Zod, servicio InventoryService con transacciones atómicas, kardex append-only, soporte de ubicación física y hook escáner láser HID.
- ✅ Fase 3 (Ventas) implementada: SalesService con venta POS transaccional atómica, cotizaciones, órdenes de trabajo, anulación append-only con nota crédito y restitución de stock.
- ✅ Fase 4 (Contabilidad) implementada: AccountingService con plan de cuentas configurable, asientos balanceados (débito=crédito), apertura/cierre de caja con arqueo y cálculo de utilidad/IVA.
- ✅ Fase 5 (Dashboard y Estadísticas) implementada: StatisticsService (KPIs diarios, productos sin rotación, top más vendidos) y componente gráfico interactivo SalesOverviewChart con Recharts adaptado al estilo Glass.
- ✅ Fase 6 (Calidad, Impresión & Entrega) completada: Plantilla de impresión térmica de 80 mm para mostrador Receipt80mm, Docker Compose PostgreSQL, TypeScript strict validado y build de producción verificado con éxito (0 errores).

## Contexto
- Proyecto: MotoTaller, sistema web para taller de motos (Maicao, La Guajira, Colombia).
- Usuario: Breiner. Comunicación en español.
- Visual: glass dashboard oscuro, acento naranja/cian, principios de animación de Emil Kowalski.
- Requisitos clave: login, dashboard, estadísticas, inventario con foto y ubicación de estante, alertas de stock bajo, escáner láser, facturas imprimibles, cotizaciones, contabilidad extensible, seguridad máxima.
- Pendientes de confirmar: referencia exacta de "glass dashboard v5", archivos de la skill de Emil Kowalski, uso de factura electrónica DIAN, modelo de impresora (ticket 80 mm o A4), si se desplegará en un PC local del taller o en la nube.

## Próxima acción
Ejecutar Fase 0 y 1 (base + núcleo seguro).
