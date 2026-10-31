# TASKS — Historial y Estado del Proyecto

Estado: ⬜ pendiente · 🟨 en curso · ✅ hecho

## Fase 0 — Base e Identidad Visual
- ✅ Next.js 16 + TS estricto + Tailwind CSS v4 + Turbopack
- ✅ Esquema de color corporativo: Deep Navy (`#1F3A5F`), Vivid Cyan (`#5AA9E6`), Ice White (`#EAF4F4`), Dark Graphite Slate (`#222831`)
- ✅ Animación Anime.js sincronizada para login y transiciones de estado
- ✅ Enrutamiento seguro y dinámico en URL (`/dashboard`, `/inventario`, `/pos`, `/ordenes`, `/cotizaciones`, `/creditos`, `/contabilidad`, `/auditoria`, `/configuracion`) con validación estricta de permisos por rol, soporte para botones Atrás/Adelante y bloqueo de accesos directos no autorizados
- ✅ Módulo maestro de Limpieza y Restablecimiento de Pruebas (`POST /api/system/reset`) con código de confirmación anti-errores
- ✅ Eliminación unitaria completa de ventas (`DELETE /api/sales/[id]`) con reposición automática al inventario
- ✅ Eliminación unitaria de créditos y cartera (`DELETE /api/credits/[id]`) con borrado de abonos vinculados

## Fase 1 — Núcleo Seguro y Cumplimiento 2026 (OWASP & Google Safe Browsing)
- ✅ Esquema Prisma completo + migraciones + seeds de roles
- ✅ Autenticación Argon2id (`m=19456`, `t=2`) + mitigación de timing attacks con verificación de hash dummy
- ✅ Formulario de Login seguro: Eliminados los accesos rápidos de prueba y credenciales precargadas
- ✅ Rate limiting en memoria con ventana deslizante contra ataques de fuerza bruta en `/api/auth/login` (bloqueo progresivo de 15 min)
- ✅ Sesiones HttpOnly con tokens criptográficos aleatorios de 256 bits y hash SHA-256 en base de datos
- ✅ Auditoría inmutable (`AuditLog`): registro de logins exitosos, intentos fallidos con IP y User-Agent
- ✅ Cabeceras HTTP de seguridad en `next.config.ts` y `middleware.ts` (HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener/Resource-Policy)
- ✅ `X-Powered-By` deshabilitado y `Cache-Control: no-store` en todas las rutas `/api/*`

## Fase 2 — Inventario Multialmacén y Coordenadas
- ✅ Mapeo de ubicación física: Bodega, Estante, Nivel y Posición
- ✅ Modal interactivo de visualización de estante y coordenadas exactas (`LocationDetailsModal`)
- ✅ Kardex append-only (`StockMovement`) + ajustes de inventario auditados
- ✅ Alertas de stock bajo / crítico
- ✅ Eliminación autorizada de repuestos obsoletos para ADMIN y SUPERADMIN (`DELETE /api/products/[id]`) con descontinuación automática para artículos con facturas históricas
- ✅ Escáner láser de código de barras y cámara web con restricción por rol

## Fase 3 — Ventas, Facturación y Cartera
- ✅ Punto de venta (POS) con transacción atómica, descuento automático de stock y cálculo de IVA
- ✅ Soporte para descuentos por porcentaje en ventas
- ✅ Facturación con consecutivo único y anulación controlada mediante Nota Crédito
- ✅ Cartera y créditos con abonos parciales y seguimiento de saldos pendientes
- ✅ Acceso directo en barra superior: "Nueva Venta", "Cotización" y "Orden de Trabajo"

## Fase 4 — Contabilidad, Caja y Arqueos
- ✅ Selector de fecha tipo calendario en Contabilidad & Caja para auditar ventas de días anteriores por separado
- ✅ Cierre de caja diaria con arqueo físico y cálculo de sobrante/faltante
- ✅ Resumen de ingresos, egresos y margen de rentabilidad
- ✅ Restricción estricta de acceso: Oculto para el rol de Trabajador / Operador

## Fase 5 — Administración Avanzada y Control de Acceso (Superadmin)
- ✅ Panel de gestión de usuarios con visualización y actualización de credenciales para Superadmin
- ✅ Modificación completa de usuarios (Nombre, Correo de acceso, Rol asignado y Contraseña) en tiempo real
- ✅ Eliminación definitiva de usuarios con reasignación histórica de comprobantes para proteger la integridad contable
- ✅ Eliminación del rol "Mecánico" (el sistema unifica operarios en el rol TRABAJADOR)
- ✅ Matriz dinámica de permisos: activación y desactivación de módulos y funcionalidades por tipo de usuario
- ✅ Acceso exclusivo a la Auditoría de Seguridad para el Super Administrador
- ✅ Menú de Configuración oculto para el rol de Trabajador

## Fase 6 — Verificación de Calidad y Producción
- ✅ 0 errores de tipado TypeScript (`npx tsc --noEmit`)
- ✅ Documentación técnica actualizada (`README.md`, `docs/SECURITY.md`, `CONTROLES_SEGURIDAD_2026.md`)
- ✅ Servidor de desarrollo Next.js 16 ejecutándose de forma continua y estable
